import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import {
  Paneset,
  Pane,
  PaneMenu,
  TextArea,
  Button,
  Row,
  Col,
} from '@folio/stripes/components';
import { FormattedMessage } from 'react-intl';
import stripesForm from '@folio/stripes/form';
import { Field, change } from 'redux-form';

import UserDetails from './UserDetails';
import FeeFineInfo from './FeeFineInfo';
import ItemInfo from './ItemInfo';

let feefineamount = 0;

function validate(type) {
  const errors = [];
  if (!type.feeFineId) {
    errors.feeFineId = <FormattedMessage id="ui-users.feefines.modal.error" />;
  }
  if (!type.ownerId) {
    errors.ownerId = <FormattedMessage id="ui-users.feefines.modal.error" />;
  }
  if (Number(type.amount) <= 0) {
    errors.amount = <FormattedMessage id="ui-users.accounts.error.message" />;
  }
  if (!type.amount && !feefineamount) {
    errors.amount = <FormattedMessage id="ui-users.errors.missingRequiredField" />;
  }
  if (Number.isNaN(Number(type.amount)) && type.amount) {
    errors.amount = <FormattedMessage id="ui-users.charge.errors.amount" />;
  }
  return errors;
}

function onChange(values, dispatch, props, previousValues) {
  if (values.ownerId !== previousValues.ownerId) {
    dispatch(change('chargefeefine', 'amount', null));
    dispatch(change('chargefeefine', 'feeFineId', null));
    feefineamount = 0;
  }
  if (values.feeFineId !== previousValues.feeFineId) {
    if (values.feeFineId) {
      dispatch(change('chargefeefine', 'amount', feefineamount));
    } else {
      dispatch(change('chargefeefine', 'amount', null));
    }
  }
  if (!values.amount && previousValues.amount) {
    feefineamount = null;
  }
  return values;
}

class ChargeForm extends React.Component {
  static propTypes = {
    user: PropTypes.object,
    item: PropTypes.object,
    stripes: PropTypes.object,
    ownerId: PropTypes.string,
    owners: PropTypes.arrayOf(PropTypes.object),
    ownerList: PropTypes.arrayOf(PropTypes.object),
    feefines: PropTypes.arrayOf(PropTypes.object),
    onClickCancel: PropTypes.func.isRequired,
    onChangeOwner: PropTypes.func.isRequired,
    onClickPay: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    onClickSelectItem: PropTypes.func.isRequired,
    onFindShared: PropTypes.func.isRequired,
    pristine: PropTypes.bool,
    submitting: PropTypes.bool,
    invalid: PropTypes.bool,
    selectedLoan: PropTypes.object,
    isPending: PropTypes.object,
  }

  constructor(props) {
    super(props);

    this.onChangeFeeFine = this.onChangeFeeFine.bind(this);
    this.query = 0;
  }

  componentDidMount() {
    feefineamount = 0.00;
    if (this.props.ownerList.length > 0) {
      this.loadServicePoints();
    }
  }

  componentDidUpdate(prevProps) {
    const {
      owners,
      ownerList,
      isPending: { servicePoints },
      onFindShared
    } = this.props;
    const {
      owners: prevOwners,
      ownerList: prevOwnerList,
      isPending: { servicePoints: prevServicePoints }
    } = prevProps;

    if (prevOwners !== owners) {
      const shared = (owners.find(o => o.owner === 'Shared') || {}).id;
      onFindShared(shared);
    }
    if (!_.isEqual(prevOwnerList, ownerList)
      || (!_.isEqual(servicePoints, prevServicePoints) && ownerList.length > 0)) {
      this.loadServicePoints();
    }
  }

  loadServicePoints = () => {
    const servicePoint = this.props.defaultServicePointId;
    const servicePoints = this.props.servicePointsIds;
    const owners = this.props.ownerList || [];
    if (servicePoint && servicePoint !== '-') {
      owners.forEach(o => {
        if (o.servicePointOwner && o.servicePointOwner.find(s => s.value === servicePoint)) {
          this.props.initialize({ ownerId: o.id });
          this.props.onChangeOwner({ target: { value: o.id } });
        }
      });
    } else if (servicePoints.length === 1) {
      const sp = servicePoints[0];
      owners.forEach(o => {
        if (o.servicePointOwner && o.servicePointOwner.find(s => s.value === sp)) {
          this.props.initialize({ ownerId: o.id });
          this.props.onChangeOwner({ target: { value: o.id } });
        }
      });
    } else if (servicePoints.length === 2) {
      const sp1 = servicePoints[0];
      const sp2 = servicePoints[1];
      owners.forEach(o => {
        if (o.servicePointOwner && o.servicePointOwner.find(s => s.value === sp1) && o.servicePointOwner.find(s => s.value === sp2)) {
          this.props.initialize({ ownerId: o.id });
          this.props.onChangeOwner({ target: { value: o.id } });
        }
      });
    }
  }

  // eslint-disable-next-line class-methods-use-this
  onChangeFeeFine(amount) {
    feefineamount = amount;
  }

  render() {
    const { selectedLoan } = this.props;
    const editable = !(selectedLoan.id);
    const { user } = this.props;
    const itemLoan = {
      id: selectedLoan.itemId,
      instance: (selectedLoan.item || {}).title,
      barcode: (selectedLoan.item || {}).barcode,
      itemStatus: ((selectedLoan.item || {}).status || {}).name,
      callNumber: (selectedLoan.item || {}).callNumber,
      location: ((selectedLoan.item || {}).location || {}).name,
      type: ((selectedLoan.item || {}).materialType || {}).name
    };
    const item = (editable) ? this.props.item : itemLoan;
    const feefineList = [];
    const owners = [];

    this.props.ownerList.forEach(own => {
      const owner = own || {};
      if (owner.owner !== 'Shared') owners.push({ label: owner.owner, value: owner.id });
    });

    this.props.feefines.forEach((feefine) => {
      const fee = {};
      fee.label = feefine.feeFineType;
      fee.value = `${feefine.id}-${this.props.ownerId}`;
      feefineList.push(fee);
    });

    const mg = { margin: '6px' };

    const lastMenu = (
      <PaneMenu>
        <Button onClick={this.props.onClickCancel} style={mg}><FormattedMessage id="ui-users.feefines.modal.cancel" /></Button>
        <Button
          disabled={this.props.pristine || this.props.submitting || this.props.invalid}
          onClick={this.props.handleSubmit(data => this.props.onSubmit({ ...data, pay: true }))}
          style={mg}
        >
          <FormattedMessage id="ui-users.charge.pay" />
        </Button>
        <Button
          disabled={this.props.pristine || this.props.submitting || this.props.invalid}
          onClick={this.props.handleSubmit(data => this.props.onSubmit({ ...data, pay: false }))}
          style={mg}
        >
          <FormattedMessage id="ui-users.charge.onlyCharge" />
        </Button>
      </PaneMenu>);

    return (
      <Paneset>
        <Pane
          defaultWidth="100%"
          dismissible
          onClose={this.props.onClickCancel}
          paneTitle={(
            <FormattedMessage id="ui-users.charge.title" />
          )}
          lastMenu={lastMenu}
        >
          <UserDetails user={user} />
          <br />
          <form>
            <FeeFineInfo
              stripes={this.props.stripes}
              owners={owners}
              isPending={this.props.isPending}
              onChangeOwner={this.props.onChangeOwner}
              onChangeFeeFine={this.onChangeFeeFine}
              feefines={this.props.feefines}
              feefineList={feefineList}
            />
            <br />
            <ItemInfo {...this.props} item={item} onClickSelectItem={this.props.onClickSelectItem} editable={editable} />
            <br />
            <h4 className="marginTopHalf"><FormattedMessage id="ui-users.charge.comment" /></h4>
            <Row>
              <Col xs={12} sm={10} md={7} lg={5}>
                <Field
                  id="comments"
                  name="comments"
                  component={TextArea}
                  fullWidth
                />
              </Col>
            </Row>
          </form>
        </Pane>
      </Paneset>
    );
  }
}

export default stripesForm({
  form: 'chargefeefine',
  onChange,
  validate,
  navigationCheck: true,
})(ChargeForm);

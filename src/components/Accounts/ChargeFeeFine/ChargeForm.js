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
  Checkbox,
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

const asyncValidate = (values, dispatch, props, blurredField) => {
  if (blurredField === 'amount') {
    const amount = parseFloat(values.amount || 0).toFixed(2);
    dispatch(change('chargefeefine', 'amount', amount));
  }
  return new Promise(resolve => resolve());
};

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
    onSubmit: PropTypes.func,
    servicePointsIds: PropTypes.arrayOf(PropTypes.string),
    defaultServicePointId: PropTypes.string,
  }

  constructor(props) {
    super(props);

    this.onChangeFeeFine = this.onChangeFeeFine.bind(this);
    this.onChangeOwner = this.onChangeOwner.bind(this);
    this.query = 0;
    this.state = { showNotify: false, notify: false };
  }

  componentDidMount() {
    const { initialValues } = this.props;
    feefineamount = 0.00;
    this.props.onChangeOwner({ target: { value: initialValues.ownerId } });
  }

  componentDidUpdate(prevProps) {
    const {
      owners,
      initialValues,
      onFindShared
    } = this.props;
    const {
      owners: prevOwners,
    } = prevProps;

    if (prevOwners !== owners) {
      const shared = (owners.find(o => o.owner === 'Shared') || {}).id;
      onFindShared(shared);
    }
    if (initialValues.ownerId !== prevProps.initialValues.ownerId) {
      this.props.onChangeOwner({ target: { value: initialValues.ownerId } });
    }
  }

  // eslint-disable-next-line class-methods-use-this
  onChangeFeeFine(amount, id) {
    feefineamount = amount;
    if (id) {
      const { owners, feefines, ownerId } = this.props;
      const feefine = feefines.find(f => f.id === id) || {};
      const owner = owners.find(o => o.id === ownerId) || {};
      if (feefine.chargeNoticeId) {
        this.setState({ showNotify: true, notify: true });
      } else if (owner.defaultChargeNoticeId) {
        this.setState({ showNotify: true, notify: true });
      } else {
        this.setState({ showNotify: false, notify: false });
      }
    }
  }

  onChangeOwner(e) {
    const { owners } = this.props;
    const ownerId = e.target.value;

    const owner = owners.find(o => o.id === ownerId) || {};
    if (owner.defaultChargeNoticeId) {
      this.setState({ showNotify: true, notify: true });
    } else {
      this.setState({ showNotify: false, notify: false });
    }
    this.props.onChangeOwner(e);
  }

  onToggleNotify = () => {
    this.setState(prevState => ({
      notify: !prevState.notify,
    }));
  }

  render() {
    const {
      initialValues,
      selectedLoan,
      user
    } = this.props;
    const { notify } = this.state;
    const editable = !(selectedLoan.id);
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
      fee.value = feefine.id;
      feefineList.push(fee);
    });

    const mg = { margin: '6px' };

    const lastMenu = (
      <PaneMenu>
        <Button onClick={this.props.onClickCancel} style={mg}><FormattedMessage id="ui-users.feefines.modal.cancel" /></Button>
        <Button
          disabled={this.props.pristine || this.props.submitting || this.props.invalid}
          onClick={this.props.handleSubmit(data => this.props.onSubmit({ ...data, pay: true, notify }))}
          style={mg}
        >
          <FormattedMessage id="ui-users.charge.Pay" />
        </Button>
        <Button
          disabled={this.props.pristine || this.props.submitting || this.props.invalid}
          onClick={this.props.handleSubmit(data => this.props.onSubmit({ ...data, pay: false, notify }))}
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
              initialValues={initialValues}
              stripes={this.props.stripes}
              owners={owners}
              isPending={this.props.isPending}
              onChangeOwner={this.onChangeOwner}
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
            {this.state.showNotify &&
              <div>
                <Row>
                  <Col xs>
                    <Field
                      name="notify"
                      component={Checkbox}
                      checked={this.state.notify}
                      onChange={this.onToggleNotify}
                      inline
                    />
                    <FormattedMessage id="ui-users.accounts.notifyPatron" />
                  </Col>
                </Row>
              </div>
            }
            <br />
            {(this.state.notify && this.state.showNotify) &&
              <div>
                <Row>
                  <Col xs>
                    <h4 className="marginTopHalf"><FormattedMessage id="ui-users.accounts.infoPatron" /></h4>
                  </Col>
                </Row>
                <Row>
                  <Col xs={12} sm={10} md={7} lg={5}>
                    <Field
                      name="patronInfo"
                      component={TextArea}
                    />
                  </Col>
                </Row>
              </div>
            }
          </form>
        </Pane>
      </Paneset>
    );
  }
}

export default stripesForm({
  form: 'chargefeefine',
  asyncBlurFields: ['amount'],
  asyncValidate,
  enableReinitialize: true,
  onChange,
  validate,
  navigationCheck: true,
})(ChargeForm);

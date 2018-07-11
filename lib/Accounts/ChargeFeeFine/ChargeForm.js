import React from 'react';
import PropTypes from 'prop-types';
import Paneset from '@folio/stripes-components/lib/Paneset';
import { FormattedMessage } from 'react-intl';
import Pane from '@folio/stripes-components/lib/Pane';
import PaneMenu from '@folio/stripes-components/lib/PaneMenu';
import Icon from '@folio/stripes-components/lib/Icon';
import TextArea from '@folio/stripes-components/lib/TextArea';
import Button from '@folio/stripes-components/lib/Button';
import stripesForm from '@folio/stripes-form';
import { Field } from 'redux-form';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';

import UserDetails from './UserDetails';
import FeeFineInfo from './FeeFineInfo';
import ItemInfo from './ItemInfo';

let feefineamount = 0;
let feefinetaxvat = 0;

function validate(type, props) {
  const errors = [];
  if (!type.feeFineId) {
    errors.feeFineId = props.stripes.intl.formatMessage({ id: 'ui-users.feefines.modal.error' });
  }
  if (!type.ownerId) {
    errors.ownerId = props.stripes.intl.formatMessage({ id: 'ui-users.feefines.modal.error' });
  }
  if (!type.amount && !feefineamount) {
    errors.amount = props.stripes.intl.formatMessage({ id: 'ui-users.errors.missingRequiredField' });
  }
  if (Number.isNaN(Number(type.amount)) && type.amount) {
    errors.amount = props.stripes.intl.formatMessage({ id: 'ui-users.charge.errors.amount' });
  }
  if (Number.isNaN(Number(type.taxVat)) && type.taxVat) {
    errors.taxVat = props.stripes.intl.formatMessage({ id: 'ui-users.charge.errors.taxVat' });
  }
  return errors;
}

function onChange(values, dispatch, props, previousValues) {
  if (values.ownerId !== previousValues.ownerId) {
    delete values.amount;
    delete values.taxVat;
    delete values.feeFineId;
    feefineamount = 0;
    feefinetaxvat = 0;
  }
  if (values.feeFineId !== previousValues.feeFineId) {
    values.amount = feefineamount;
    values.taxVat = feefinetaxvat;
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
    feefines: PropTypes.arrayOf(PropTypes.object),
    onClickCharge: PropTypes.func.isRequired,
    onClickCancel: PropTypes.func.isRequired,
    onChangeOwner: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    onClickSelectItem: PropTypes.func.isRequired,
    onFindShared: PropTypes.func.isRequired,
    pristine: PropTypes.bool,
    submitting: PropTypes.bool,
    invalid: PropTypes.bool,
  }

  constructor(props) {
    super(props);

    this.onChangeFeeFine = this.onChangeFeeFine.bind(this);
    this.query = 0;
  }

  componentDidMount() {
    feefinetaxvat = 0.00;
    feefineamount = 0.00;
  }

  componentDidUpdate(prevProps) {
    if (prevProps.owners !== this.props.owners) {
      const shared = (this.props.owners.find(o => o.owner === 'Shared') || {}).id;
      this.props.onFindShared(shared);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  onChangeFeeFine(amount, taxvat) {
    feefineamount = amount;
    feefinetaxvat = taxvat;
  }

  render() {
    const { item, user } = this.props;
    const feefineList = [];
    const owners = [];

    this.props.owners.forEach((owner) => {
      if (owner.owner !== 'Shared') owners.push({ label: owner.owner, value: owner.id });
    });

    this.props.feefines.forEach((feefine) => {
      const fee = {};
      fee.label = feefine.feeFineType;
      fee.value = `${feefine.id}-${this.props.ownerId}`;
      feefineList.push(fee);
    });

    const mg = { margin: '6px' };
    const firstMenu = (
      <PaneMenu>
        <button onClick={this.props.onClickCancel}>
          <Row>
            <Col><Icon icon="left-double-chevron" size="large" /></Col>
            <Col><span style={{ fontSize: 'x-large' }}><FormattedMessage id="ui-users.charge.title" /></span></Col>
          </Row>
        </button>
      </PaneMenu>
    );
    const lastMenu = (
      <PaneMenu>
        <Button onClick={this.props.onClickCancel} style={mg} buttonStyle="secondary"><FormattedMessage id="ui-users.feefines.modal.cancel" /></Button>
        <Button
          disabled={this.props.pristine || this.props.submitting || this.props.invalid}
          onClick={this.props.handleSubmit((data) => {
          const type = {};
          type.amount = data.amount;
          type.feeFineId = data.feeFineId.substring(0, 36);
          if (Number.isNaN(Number(data.taxVat))) data.taxVat = 0;
          type.amount = parseFloat(data.amount) + (parseFloat(data.amount * data.taxVat) / 100);
          type.comments = data.comments;
          type.ownerId = data.ownerId;
          type.paymentStatus = {
            name: 'Paid Fully',
          };
          type.status = {
            name: 'Closed',
          };
          type.remaining = 0;
          this.props.onClickCharge(type);
        })}
          style={mg}
        >
          <FormattedMessage id="ui-users.charge.pay" />
        </Button>
        <Button
          disabled={this.props.pristine || this.props.submitting || this.props.invalid}
          onClick={this.props.handleSubmit((data) => {
          const type = {};
          type.feeFineId = data.feeFineId.substring(0, 36);
          if (Number.isNaN(Number(data.taxVat))) data.taxVat = 0;
          type.amount = parseFloat(data.amount) + (parseFloat(data.amount * data.taxVat) / 100);
          type.comments = data.comments;
          type.ownerId = data.ownerId;
          type.paymentStatus = {
            name: 'Non Payment',
          };
          type.status = {
            name: 'Open',
          };
          type.remaining = type.amount;
          this.props.onClickCharge(type);
        })}
          style={mg}
        >
          <FormattedMessage id="ui-users.charge.onlyCharge" />
        </Button>
      </PaneMenu>);

    return (
      <Paneset>
        <Pane defaultWidth="100%" paneTittle="" firstMenu={firstMenu} lastMenu={lastMenu}>
          <UserDetails user={user} />
          <br />
          <form>
            <FeeFineInfo
              stripes={this.props.stripes}
              owners={owners}
              onChangeOwner={this.props.onChangeOwner}
              onChangeFeeFine={this.onChangeFeeFine}
              feefines={this.props.feefines}
              feefineList={feefineList}
            />
            <br />
            <ItemInfo {...this.props} item={item} onClickSelectItem={this.props.onClickSelectItem} />
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

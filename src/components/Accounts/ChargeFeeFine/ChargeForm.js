import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field } from 'react-final-form';
import setFieldData from 'final-form-set-field-data';
import {
  isEqual,
  toNumber,
} from 'lodash';

import stripesFinalForm from '@folio/stripes/final-form';
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

import UserInfo from './UserInfo';
import FeeFineInfo from './FeeFineInfo';
import ItemInfo from './ItemInfo';

function showValidationErrors({ feeFineId, ownerId, amount }) {
  const errors = {};
  if (!feeFineId) {
    errors.feeFineId = <FormattedMessage id="ui-users.feefines.modal.error" />;
  }
  if (!ownerId) {
    errors.ownerId = <FormattedMessage id="ui-users.feefines.modal.error" />;
  }
  if (toNumber(amount) <= 0) {
    errors.amount = <FormattedMessage id="ui-users.accounts.error.message" />;
  }
  if (!amount) {
    errors.amount = <FormattedMessage id="ui-users.errors.missingRequiredField" />;
  }
  if (Number.isNaN(toNumber(amount)) && amount) {
    errors.amount = <FormattedMessage id="ui-users.charge.errors.amount" />;
  }

  return errors;
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
    form: PropTypes.object.isRequired,
    onClickCancel: PropTypes.func,
    onChangeOwner: PropTypes.func.isRequired,
    onChangeFeeFine: PropTypes.func.isRequired,
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
    location: PropTypes.object,
    history: PropTypes.object,
    initialValues: PropTypes.object,
    match: PropTypes.object,
    feeFineTypeOptions: PropTypes.arrayOf(PropTypes.object).isRequired,
  }

  constructor(props) {
    super(props);

    this.onChangeFeeFine = this.onChangeFeeFine.bind(this);
    this.onChangeOwner = this.onChangeOwner.bind(this);
    this.query = 0;
    this.feeFineId = null;
  }

  componentDidUpdate(prevProps) {
    const {
      owners,
      onFindShared,
    } = this.props;
    const { owners: prevOwners } = prevProps;

    if (prevOwners !== owners) {
      const shared = (owners.find(o => o.owner === 'Shared') || {}).id;
      onFindShared(shared);
    }
  }

  async onChangeFeeFine(e) {
    const {
      feefines,
      form: { change },
    } = this.props;

    if (e?.target?.value) {
      const feeFineId = e.target.value;
      await this.props.onChangeFeeFine(e);
      const feefine = feefines.find(f => f.id === feeFineId) || {};
      change('feeFineId', feefine.id);
      this.amount = feefine.defaultAmount || 0;
      this.amount = parseFloat(this.amount).toFixed(2);
      const defaultAmount = parseFloat(feefine.defaultAmount || 0).toFixed(2);
      change('amount', defaultAmount);
    }
  }

  onChangeOwner(ownerId) {
    const { form: { change, reset } } = this.props;
    reset();

    this.props.onChangeOwner(ownerId);
    change('ownerId', ownerId);
  }

  goToAccounts = () => {
    const {
      history,
      match: {
        params: { id },
      },
    } = this.props;

    history.push(`/users/${id}/accounts/open`);
  }

  render() {
    const {
      user,
      selectedLoan: selectedLoanProp,
      onSubmit,
      handleSubmit,
      initialValues,
      feeFineTypeOptions,
      form,
      form : {
        getState,
        change,
      },
      submitting,
      pristine,
      isPending,
      stripes,
    } = this.props;
    const {
      valid,
      values: {
        feeFineId,
        ownerId,
        notify,
      }
    } = getState();

    const selectedLoan = selectedLoanProp || {};
    const editable = !(selectedLoan.id);
    const itemLoan = {
      id: selectedLoan.itemId,
      instance: (selectedLoan.item || {}).title,
      barcode: (selectedLoan.item || {}).barcode,
      itemStatus: ((selectedLoan.item || {}).status || {}).name,
      callNumber: (selectedLoan.item || {}).callNumber,
      location: selectedLoan?.item?.effectiveLocation?.name,
      type: ((selectedLoan.item || {}).materialType || {}).name
    };
    const item = (editable) ? this.props.item : itemLoan;
    const feefineList = [];
    const ownerOptions = [];

    this.props.owners.forEach((own = {}) => {
      if (own.owner !== 'Shared') ownerOptions.push({ label: own.owner, value: own.id });
    });

    feeFineTypeOptions.forEach((feefineItem) => {
      const fee = {};
      fee.label = feefineItem.feeFineType;
      fee.value = feefineItem.id;
      feefineList.push(fee);
    });

    let showNotify = false;
    const feefine = this.props.feefines.find(f => f.id === feeFineId) || {};
    const owner = this.props.owners.find(o => o.id === ownerId) || {};
    if (feefine?.chargeNoticeId || owner?.defaultChargeNoticeId) {
      showNotify = true;
    }

    const lastMenu = (
      <PaneMenu>
        <Button
          id="cancelCharge"
          onClick={this.goToAccounts}
          marginBottom0
        >
          <FormattedMessage id="ui-users.feefines.modal.cancel" />
        </Button>
        <Button
          id="chargeAndPay"
          disabled={pristine || submitting || !valid}
          onClick={() => {
            change('pay', true);
            handleSubmit(data => onSubmit(data));
          }}
          marginBottom0
        >
          <FormattedMessage id="ui-users.charge.Pay" />
        </Button>
        <Button
          id="chargeOnly"
          disabled={pristine || submitting || !valid}
          onClick={() => {
            change('pay', false);
            handleSubmit(data => onSubmit(data));
          }}
          marginBottom0
        >
          <FormattedMessage id="ui-users.charge.onlyCharge" />
        </Button>
      </PaneMenu>);

    return (
      <Paneset data-test-charge-form>
        <Pane
          defaultWidth="100%"
          dismissible
          onClose={this.goToAccounts}
          paneTitle={(
            <FormattedMessage id="ui-users.charge.title" />
          )}
          lastMenu={lastMenu}
        >
          <UserInfo user={user} />
          <br />
          <form
            onSubmit={handleSubmit}
            id="feeFineChargeForm"
          >
            <FeeFineInfo
              form={form}
              stripes={stripes}
              initialValues={initialValues}
              ownerOptions={ownerOptions}
              isPending={isPending}
              onChangeOwner={this.onChangeOwner}
              onChangeFeeFine={this.onChangeFeeFine}
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
            {showNotify &&
              <div>
                <Row>
                  <Col xs>
                    <Field
                      name="notify"
                      component={Checkbox}
                      type="checkbox"
                      inline
                      label={<FormattedMessage id="ui-users.accounts.notifyPatron" />}
                    />
                  </Col>
                </Row>
              </div>
            }
            <br />
            {notify && showNotify &&
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

export default stripesFinalForm({
  initialValuesEqual: (a, b) => isEqual(a, b),
  navigationCheck: true,
  subscription: { values: true },
  mutators: { setFieldData },
  validate: showValidationErrors,
})(ChargeForm);

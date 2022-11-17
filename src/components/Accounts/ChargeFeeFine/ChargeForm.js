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
  TextArea,
  Button,
  Modal,
  Row,
  Col,
  Checkbox,
} from '@folio/stripes/components';
import { effectiveCallNumber } from '@folio/stripes/util';

import UserInfo from './UserInfo';
import FeeFineInfo from './FeeFineInfo';
import ItemInfo from './ItemInfo';
import { SHARED_OWNER } from '../../../constants';

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
    location: PropTypes.object,
    history: PropTypes.object,
    initialValues: PropTypes.object,
    match: PropTypes.object,
    feeFineTypeOptions: PropTypes.arrayOf(PropTypes.object).isRequired,
    intl: PropTypes.object,
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
      const shared = (owners.find(o => o.owner === SHARED_OWNER) || {}).id;
      onFindShared(shared);
    }
  }

  onChangeFeeFine(e) {
    const {
      feefines,
      form: { change },
    } = this.props;

    if (e?.target?.value) {
      const feeFineId = e.target.value;
      const feefine = feefines.find(f => f.id === feeFineId) || {};
      const owner = this.props.owners.find(o => o.id === feefine.ownerId) || {};

      const defaultAmount = parseFloat(feefine.defaultAmount || 0).toFixed(2);
      let showNotify = false;
      if (feefine?.chargeNoticeId || owner?.defaultChargeNoticeId) {
        showNotify = true;
      }
      change('notify', showNotify);
      change('feeFineId', feefine.id);
      change('amount', defaultAmount);
    }
  }

  onChangeOwner(ownerId) {
    const { form: { change, reset } } = this.props;
    reset();
    this.props.onChangeOwner(ownerId);
    let showNotify = false;
    const owner = this.props.owners.find(o => o.id === ownerId) || {};
    if (owner?.defaultChargeNoticeId) {
      showNotify = true;
    }
    change('notify', showNotify);
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
      intl: { formatMessage },
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
      },
    } = getState();

    const selectedLoan = selectedLoanProp || {};
    const editable = !(selectedLoan.id);
    const itemLoan = {
      id: selectedLoan.itemId,
      instance: (selectedLoan.item || {}).title,
      barcode: (selectedLoan.item || {}).barcode,
      itemStatus: ((selectedLoan.item || {}).status || {}).name,
      callNumber: effectiveCallNumber(selectedLoan.item || {}),
      location: selectedLoan?.item?.effectiveLocation?.name,
      type: ((selectedLoan.item || {}).materialType || {}).name,
    };
    const item = (editable) ? this.props.item : itemLoan;
    const feefineList = [];
    const ownerOptions = [];

    this.props.owners.forEach((own = {}) => {
      if (own.owner !== SHARED_OWNER) ownerOptions.push({ label: own.owner, value: own.id });
    });

    feeFineTypeOptions.forEach((feefineItem) => {
      if (!feefineItem.automatic) {
        const fee = {};
        fee.label = feefineItem.feeFineType;
        fee.value = feefineItem.id;
        feefineList.push(fee);
      }
    });

    let showNotify = false;
    const feefine = this.props.feefines.find(f => f.id === feeFineId) || {};
    const owner = this.props.owners.find(o => o.id === ownerId) || {};
    if (feefine?.chargeNoticeId || owner?.defaultChargeNoticeId) {
      showNotify = true;
    }
    return (
      <Modal
        data-test-charge-form
        id="new-modal"
        open
        label={<FormattedMessage id="ui-users.charge.title" />}
        onClose={this.goToAccounts}
        size="medium"
        dismissible
      >
        <UserInfo user={user} />
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
          <ItemInfo {...this.props} item={item} onClickSelectItem={this.props.onClickSelectItem} editable={editable} />
          <h4 className="marginTopHalf"><FormattedMessage id="ui-users.charge.comment" /></h4>
          <Row>
            <Col xs={12}>

              <Field
                id="comments"
                name="comments"
                aria-label={formatMessage({ id: 'ui-users.charge.comment.label' })}
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
          {notify && showNotify &&
          <div>
            <Row>
              <Col xs={12}>
                <h4 className="marginTopHalf"><FormattedMessage id="ui-users.accounts.infoPatron" /></h4>
              </Col>
            </Row>
            <Row>
              <Col xs>
                <Field
                  name="patronInfo"
                  component={TextArea}
                />
              </Col>
            </Row>
          </div>
          }

          <Row end="xs">
            <Col>
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
            </Col>
          </Row>
        </form>
      </Modal>
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

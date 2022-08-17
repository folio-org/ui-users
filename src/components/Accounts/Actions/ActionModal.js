import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field } from 'react-final-form';
import setFieldData from 'final-form-set-field-data';

import stripesFinalForm from '@folio/stripes/final-form';
import {
  Row,
  Col,
  Button,
  TextArea,
  Modal,
  NoValue,
  TextField,
  Checkbox,
  Select,
} from '@folio/stripes/components';

import { calculateSelectedAmount } from '../accountFunctions';
import {
  FEE_FINE_ACTIONS,
  SHARED_OWNER,
} from '../../../constants';

import css from './PayWaive.css';

class ActionModal extends React.Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    onClose: PropTypes.func,
    handleSubmit: PropTypes.func,
    open: PropTypes.bool,
    accounts: PropTypes.arrayOf(PropTypes.object),
    feeFineActions: PropTypes.arrayOf(PropTypes.object),
    data: PropTypes.arrayOf(PropTypes.object),
    balance: PropTypes.string,
    totalPaidAmount: PropTypes.string,
    owedAmount: PropTypes.string,
    submitting: PropTypes.bool,
    pristine: PropTypes.bool,
    reset: PropTypes.func,
    commentRequired: PropTypes.bool,
    owners: PropTypes.arrayOf(PropTypes.object),
    label: PropTypes.string,
    action: PropTypes.string,
    intl: PropTypes.object.isRequired,
    checkAmount: PropTypes.string,
    okapi: PropTypes.object,
    initialValues: PropTypes.object,
  };

  static defaultProps = {
    totalPaidAmount: '',
    owedAmount: '',
  }

  constructor(props) {
    super(props);

    this.state = {
      actionAllowed: false,
      accountRemainingAmount: '0.00',
      prevValidatedAmount: null,
      prevValidationError: '',
    };

    this._isMounted = false;
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  onClose = () => {
    const { onClose, form: { reset } } = this.props;
    this._isMounted = false;

    onClose();
    reset();
  }

  renderModalLabel() {
    const {
      accounts = [],
      feeFineActions = [],
      action,
      form: { getState },
      intl: { formatMessage },
    } = this.props;

    const { values: { amount } } = getState();
    const selected = calculateSelectedAmount(accounts, this.isRefundAction(action), feeFineActions);
    const type = parseFloat(amount) < parseFloat(selected)
      ? formatMessage({ id: `ui-users.accounts.${action}.summary.partially` })
      : formatMessage({ id: `ui-users.accounts.${action}.summary.fully` });

    return (
      <FormattedMessage
        id="ui-users.accounts.summary"
        values={{
          count: accounts.length,
          amount,
          type,
        }}
      />
    );
  }

  renderTransactionInfo = () => {
    const { accounts } = this.props;
    return (
      <Col xs={4}>
        {accounts.length > 1 ? <br /> : ''}
        <Row>
          <Col xs>
            <FormattedMessage id="ui-users.accounts.payment.field.transactionInfo" />
          </Col>
        </Row>
        <Row>
          <Col xs>
            <FormattedMessage id="ui-users.accounts.payment.transaction.placeholder">
              {placeholder => (
                <Field
                  id="transaction"
                  name="transaction"
                  component={TextField}
                  placeholder={placeholder}
                />
              )}
            </FormattedMessage>
          </Col>
        </Row>
      </Col>
    );
  }

  renderMethod = (options) => {
    const {
      action,
      intl: { formatMessage },
    } = this.props;

    return (
      <Col xs={(this.isPaymentAction(action) || this.isTransferAction(action)) ? 3 : 7}>
        <Row>
          <Col xs>
            <FormattedMessage id={`ui-users.accounts.${action}.method`} />
            *
          </Col>
        </Row>
        <Row>
          <Col xs id="action-selection">
            {_.isEmpty(options)
              ? <Field
                  name="method"
                  component={Select}
                  dataOptions={options}
                  placeholder={formatMessage({ id: `ui-users.accounts.${action}.method.placeholder` })}
                  error={formatMessage({ id: `ui-users.accounts.${action}.error.select` })}
              />
              : <Field
                  name="method"
                  component={Select}
                  dataOptions={options}
                  placeholder={formatMessage({ id: `ui-users.accounts.${action}.method.placeholder` })}
                  validate={this.validateMethod}
              />
            }
          </Col>
        </Row>
      </Col>
    );
  }

  isPaymentAction = (action) => {
    return action === FEE_FINE_ACTIONS.PAYMENT;
  }

  isRefundAction = (action) => {
    return action === FEE_FINE_ACTIONS.REFUND;
  }

  isTransferAction = (action) => {
    return action === FEE_FINE_ACTIONS.TRANSFER;
  }

  onChangeOwner = ({ target: { value } }) => {
    const { change } = this.props.form;

    change('ownerId', value);
    change('method', null);
  }

  singleItemCheck = (amount, accountId) => {
    const {
      checkAmount,
      okapi,
    } = this.props;

    return fetch(`${okapi.url}/accounts/${accountId}/${checkAmount}`,
      {
        method: 'POST',
        headers: {
          'X-Okapi-Tenant': okapi.tenant,
          'X-Okapi-Token': okapi.token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount })
      });
  };

  multipleItemsCheck = (amount, accounts) => {
    const {
      checkAmount,
      okapi,
    } = this.props;

    const accountIds = accounts.reduce((ids, account) => {
      ids.push(account.id);
      return ids;
    }, []);

    return fetch(`${okapi.url}/accounts-bulk/${checkAmount}`,
      {
        method: 'POST',
        headers: {
          'X-Okapi-Tenant': okapi.tenant,
          'X-Okapi-Token': okapi.token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accountIds, amount })
      });
  };

  triggerCheckEndpoint = (amount, accounts) => {
    if (accounts.length === 1) {
      const { id } = _.head(accounts) || {};
      return this.singleItemCheck(amount, id);
    }

    return this.multipleItemsCheck(amount, accounts);
  };

  validateAmount = async (value) => {
    let error;

    const {
      accounts,
      feeFineActions,
      action,
    } = this.props;

    const {
      actionAllowed,
      accountRemainingAmount,
      prevValidatedAmount,
      prevValidationError,
    } = this.state;

    if (_.isEmpty(value)) {
      const selectedAmount = calculateSelectedAmount(accounts, this.isRefundAction(action), feeFineActions);

      this.setState({
        accountRemainingAmount: selectedAmount,
        prevValidatedAmount: null,
      });
      error = <FormattedMessage id="ui-users.accounts.error.field" />;
    } else if (value !== prevValidatedAmount && this._isMounted) {
      const response = await this.triggerCheckEndpoint(value, accounts);
      const {
        allowed,
        errorMessage,
        remainingAmount,
      } = await response.json();

      this.setState({ prevValidatedAmount: value });

      if (!_.isUndefined(errorMessage)) {
        this.setState({ prevValidationError: errorMessage });
        error = errorMessage;
      }

      if (actionAllowed !== allowed || accountRemainingAmount !== remainingAmount) {
        this.setState({
          actionAllowed: allowed,
          accountRemainingAmount: remainingAmount,
          prevValidationError: errorMessage,
        });
      }
    } else {
      error = prevValidationError;
    }

    return error;
  }

  validateMethod = (value) => {
    let error;

    if (!value) {
      error = <FormattedMessage id="ui-users.feefines.modal.error" />;
    }

    return error;
  }

  validateComment = (value) => {
    let error;
    const { commentRequired } = this.props;

    if (commentRequired && !value) {
      error = <FormattedMessage id="ui-users.accounts.error.comment" />;
    }

    return error;
  }

  render() {
    const {
      accounts,
      feeFineActions,
      action,
      balance,
      initialValues,
      totalPaidAmount,
      owedAmount,
      commentRequired,
      form: { getState },
      intl: { formatMessage },
      data,
      handleSubmit,
      label,
      open,
      owners,
      pristine,
      submitting,
    } = this.props;
    const { accountRemainingAmount } = this.state;

    const {
      valid,
      values: {
        notify,
        ownerId,
      }
    } = getState();

    const selected = calculateSelectedAmount(accounts, this.isRefundAction(action), feeFineActions);
    const ownerOptions = owners.filter(o => o.owner !== SHARED_OWNER).map(o => ({ value: o.id, label: o.owner }));

    let options = (this.isPaymentAction(action)) ? data.filter(d => (d.ownerId === (accounts.length > 1 ? ownerId : (accounts[0] || {}).ownerId))) : data;
    options = (this.isTransferAction(action))
      ? data.filter(d => (d.ownerId === ownerId))
      : options;
    options = _.uniqBy(options.map(o => ({ id: o.id, label: o[label] })), 'label');

    const showNotify = initialValues.notify;

    return (
      <Modal
        data-test-fee-fine-action-modal
        id={`${action}-modal`}
        open={open}
        label={<FormattedMessage id={`ui-users.accounts.${action}.modalLabel`} />}
        onClose={this.onClose}
        size="medium"
        dismissible
      >
        <form onSubmit={handleSubmit}>
          <Row>
            <Col xs>{this.renderModalLabel()}</Col>
          </Row>
          <br />
          <Row>
            <Col xs={5}>
              { this.isRefundAction(action) ? (
                <Row end="xs">
                  <Col xs={7}>
                    <FormattedMessage id="ui-users.accounts.totalPaid" />
                    :
                  </Col>
                  <Col xs={4}>
                    {totalPaidAmount}
                  </Col>
                </Row>
              ) : (
                <Row end="xs">
                  <Col xs={7}>
                    <FormattedMessage id="ui-users.accounts.totalOwed" />
                    :
                  </Col>
                  <Col xs={4}>
                    {balance}
                  </Col>
                </Row>
              ) }
              <Row end="xs">
                <Col xs={7}>
                  <FormattedMessage id="ui-users.accounts.selectedAmount" />
                  :
                </Col>
                <Col xs={4}>
                  {selected}
                </Col>
              </Row>
              <Row end="xs">
                <Col xs={7}>
                  <b>
                    <FormattedMessage id={`ui-users.accounts.${action}.amount`} />
                    *:
                  </b>
                </Col>
                <Col xs={4} className={css.customCol}>
                  <div>
                    <Field
                      id="amount"
                      name="amount"
                      component={TextField}
                      hasClearIcon={false}
                      fullWidth
                      marginBottom0
                      autoFocus
                      required
                      validate={this.validateAmount}
                    />
                  </div>
                </Col>
              </Row>
              <Row end="xs">
                <Col xs={7}>
                  <FormattedMessage id="ui-users.accounts.remainingAmount" />
                  :
                </Col>
                <Col xs={4}>
                  { accountRemainingAmount || <NoValue /> }
                </Col>
              </Row>
              { this.isRefundAction(action) && (
                <Row end="xs">
                  <Col xs={7}>
                    <FormattedMessage id="ui-users.accounts.otherOwed" />
                    :
                  </Col>
                  <Col xs={4}>
                    {owedAmount}
                  </Col>
                </Row>
              )}
            </Col>
            {((this.isPaymentAction(action) && accounts.length > 1) || this.isTransferAction(action)) &&
              <Col xs={4}>
                <Row>
                  <Col xs>
                    <FormattedMessage id="ui-users.accounts.payment.field.ownerDesk" />
                    *
                  </Col>
                </Row>
                <Row>
                  <Col
                    xs
                    data-test-payment-owner
                  >
                    <Field
                      id="ownerId"
                      name="ownerId"
                      component={Select}
                      dataOptions={ownerOptions}
                      placeholder={formatMessage({ id: 'ui-users.accounts.payment.owner.placeholder' })}
                      onChange={this.onChangeOwner}
                      defaultValue={ownerId}
                    />
                  </Col>
                </Row>
              </Col>
            }
            {this.renderMethod(options)}
            {this.isPaymentAction(action) && this.renderTransactionInfo()}
          </Row>
          <br />
          {(action === 'paymany' && accounts.length > 1) &&
            <Row>
              {this.renderTransactionInfo()}
            </Row>
          }
          <Row>
            <Col xs>
              <FormattedMessage id="ui-users.accounts.commentStaff" />
              {(commentRequired) ? '*' : ''}
            </Col>
          </Row>
          <br />
          <Row>
            <Col xs>
              <Field
                id="comments"
                name="comment"
                component={TextArea}
                validate={this.validateComment}
              />
            </Col>
          </Row>
          {showNotify &&
            <div>
              <Row>
                <Col xs>
                  <Field
                    id="notify"
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
                  <FormattedMessage id="ui-users.accounts.infoPatron" />
                </Col>
              </Row>
              <br />
              <Row>
                <Col xs>
                  <Field
                    id="patronInfo"
                    name="patronInfo"
                    component={TextArea}
                  />
                </Col>
              </Row>
            </div>
          }
          <Row end="xs">
            <Col xs>
              <Button
                id="cancel-button"
                onClick={this.onClose}
              >
                <FormattedMessage id="ui-users.cancel" />
              </Button>
              <Button
                id="submit-button"
                buttonStyle="primary"
                type="submit"
                disabled={pristine || submitting || !valid || !this.state.actionAllowed}
              >
                <FormattedMessage id={`ui-users.accounts.${action}`} />
              </Button>
            </Col>
          </Row>
        </form>
      </Modal>
    );
  }
}

export default stripesFinalForm({
  initialValuesEqual: (a, b) => _.isEqual(a, b),
  navigationCheck: true,
  subscription: { values: true },
  mutators: { setFieldData },
})(ActionModal);

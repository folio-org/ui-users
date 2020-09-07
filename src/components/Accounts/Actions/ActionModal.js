import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { Field } from 'react-final-form';
import stripesFinalForm from '@folio/stripes/final-form';

import SafeHTMLMessage from '@folio/react-intl-safe-html';
import {
  Row,
  Col,
  Button,
  TextArea,
  Modal,
  TextField,
  Checkbox,
  Select,
} from '@folio/stripes/components';

import { calculateSelectedAmount } from '../accountFunctions';
import css from './PayWaive.css';

class ActionModal extends React.Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    onClose: PropTypes.func,
    handleSubmit: PropTypes.func,
    open: PropTypes.bool,
    accounts: PropTypes.arrayOf(PropTypes.object),
    data: PropTypes.arrayOf(PropTypes.object),
    balance: PropTypes.string,
    submitting: PropTypes.bool,
    pristine: PropTypes.bool,
    reset: PropTypes.func,
    commentRequired: PropTypes.bool,
    owners: PropTypes.arrayOf(PropTypes.object),
    feefines: PropTypes.arrayOf(PropTypes.object),
    label: PropTypes.string,
    action: PropTypes.string,
    intl: PropTypes.object,
    checkAmount: PropTypes.string,
    okapi: PropTypes.object,
  };

  constructor(props) {
    super(props);

    this.state = {
      actionAllowed: false,
      remainingAmount: '0.00'
    };
  }

  onClose = () => {
    const { onClose, form: { reset } } = this.props;

    onClose();
    reset();
  }

  renderModalLabel() {
    const {
      accounts = [],
      action,
      form: { getState },
      intl: { formatMessage },
    } = this.props;

    const { values: { amount } } = getState();

    const selected = calculateSelectedAmount(accounts);
    const type = parseFloat(amount) < parseFloat(selected)
      ? formatMessage({ id: `ui-users.accounts.${action}.summary.partially` })
      : formatMessage({ id: `ui-users.accounts.${action}.summary.fully` });

    return (
      <SafeHTMLMessage
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
    const { action } = this.props;
    return (
      <Col xs={this.isPaymentAction(action) ? 3 : 7}>
        <Row>
          <Col xs>
            <FormattedMessage id={`ui-users.accounts.${action}.method`} />
            *
          </Col>
        </Row>
        <Row>
          <Col xs id="action-selection">
            <FormattedMessage id={`ui-users.accounts.${action}.method.placeholder`}>
              {placeholder => (
                <Field
                  name="method"
                  component={Select}
                  dataOptions={options}
                  placeholder={placeholder}
                  validate={this.validateMethod}
                />
              )}
            </FormattedMessage>
          </Col>
        </Row>
      </Col>
    );
  }

  isPaymentAction = (action) => {
    return action === 'payment';
  }

  onChangeOwner = () => {
    const { form: { change } } = this.props;
    change('payment-many-modal', 'method', null);
  }

  triggerCheckEndpoint = (amount, accountId) => {
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

  validateAmount = async (value) => {
    let error;

    if (_.isEmpty(value)) {
      error = <FormattedMessage id="ui-users.accounts.error.field" />;
    } else {
      const { id } = _.head(this.props.accounts);
      const response = await this.triggerCheckEndpoint(value, id);
      const {
        allowed,
        errorMessage,
        remainingAmount,
      } = await response.json();

      if (!_.isUndefined(errorMessage)) {
        error = errorMessage;
      }

      if (this.state.actionAllowed !== allowed || this.state.remainingAmount !== remainingAmount) {
        this.setState({ actionAllowed: allowed, remainingAmount });
      }
    }

    return error;
  }

  validateMethod = (value) => {
    let error;
    const { action } = this.props;

    if (!value) {
      error = <FormattedMessage id={`ui-users.accounts.${action}.error.select`} />;
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
      action,
      balance,
      commentRequired,
      form: { getState },
      data,
      feefines,
      handleSubmit,
      label,
      open,
      owners,
      pristine,
      submitting,
    } = this.props;

    const {
      valid,
      values: {
        notify,
        ownerId,
      }
    } = getState();

    let showNotify = false;
    accounts.forEach(a => {
      const feefine = feefines.find(f => f.id === a.feeFineId) || {};
      const owner = owners.find(o => o.id === a.ownerId) || {};
      if (feefine.actionNoticeId || owner.defaultActionNoticeId) {
        showNotify = true;
      }
    });

    const selected = calculateSelectedAmount(accounts);
    const ownerOptions = owners.filter(o => o.owner !== 'Shared').map(o => ({ value: o.id, label: o.owner }));

    let options = (this.isPaymentAction(action)) ? data.filter(d => (d.ownerId === (accounts.length > 1 ? ownerId : (accounts[0] || {}).ownerId))) : data;
    options = _.uniqBy(options.map(o => ({ id: o.id, label: o[label] })), 'label');

    return (
      <Modal
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
              <Row end="xs">
                <Col xs={7}>
                  <FormattedMessage id="ui-users.accounts.totalOwed" />
                  :
                </Col>
                <Col xs={4}>
                  {balance}
                </Col>
              </Row>
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
              { !_.isUndefined(this.state.remainingAmount) && (
                <Row end="xs">
                  <Col xs={7}>
                    <FormattedMessage id="ui-users.accounts.remainingAmount" />
                    :
                  </Col>
                  <Col xs={4}>
                    {this.state.remainingAmount}
                  </Col>
                </Row>
              )}
            </Col>
            {(this.isPaymentAction(action) && accounts.length > 1) &&
              <Col xs={4}>
                <Row>
                  <Col xs>
                    <FormattedMessage id="ui-users.accounts.payment.field.ownerDesk" />
                    *
                  </Col>
                </Row>
                <Row>
                  <Col xs>
                    <FormattedMessage id="ui-users.accounts.payment.owner.placeholder">
                      {placeholder => (
                        <Field
                          id="ownerId"
                          name="ownerId"
                          component={Select}
                          dataOptions={ownerOptions}
                          placeholder={placeholder}
                          onChange={this.onChangeOwner}
                        />
                      )}
                    </FormattedMessage>
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
                    checked={notify}
                    inline
                  />
                  {' '}
                  <FormattedMessage id="ui-users.accounts.notifyPatron" />
                </Col>
              </Row>
            </div>
          }
          <br />
          {(notify && showNotify) &&
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

export default stripesFinalForm({})(ActionModal);

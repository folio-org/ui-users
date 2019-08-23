import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  Field,
  reduxForm,
  change,
  formValueSelector,
} from 'redux-form';
import { connect } from 'react-redux';
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

const validate = (values, props) => {
  const {
    accounts,
    action,
    commentRequired
  } = props;

  const selected = calculateSelectedAmount(accounts);
  const errors = {};

  if (!parseFloat(values.amount)) {
    errors.amount = <FormattedMessage id="ui-users.accounts.error.field" />;
  }
  if (parseFloat(values.amount) <= 0) {
    errors.amount = <FormattedMessage id={`ui-users.accounts.${action}.error.amount`} />;
  }
  if (!values.method) {
    errors.method = <FormattedMessage id="ui-users.accounts.error.select" />;
  }
  if (commentRequired && !values.comment) {
    errors.comment = <FormattedMessage id="ui-users.accounts.error.comment" />;
  }
  if (parseFloat(values.amount) > parseFloat(selected)) {
    errors.amount = <FormattedMessage id={`ui-users.accounts.${action}.error.exceeds`} />;
  }

  return errors;
};

class ActionModal extends React.Component {
  static propTypes = {
    onClose: PropTypes.func,
    handleSubmit: PropTypes.func,
    open: PropTypes.bool,
    accounts: PropTypes.arrayOf(PropTypes.object),
    data: PropTypes.arrayOf(PropTypes.object),
    balance: PropTypes.number,
    submitting: PropTypes.bool,
    invalid: PropTypes.bool,
    pristine: PropTypes.bool,
    reset: PropTypes.func,
    commentRequired: PropTypes.bool,
    owners: PropTypes.arrayOf(PropTypes.object),
    feefines: PropTypes.arrayOf(PropTypes.object),
    label: PropTypes.string,
    action: PropTypes.string,
    intl: PropTypes.object,
    currentValues: PropTypes.object,
    dispatch: PropTypes.func,
  };

  onClose = () => {
    const { onClose, reset } = this.props;

    onClose();
    reset();
  }

  renderModalLabel() {
    const {
      accounts = [],
      action,
      currentValues: { amount },
      intl: { formatMessage },
    } = this.props;

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
            {'*'}
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

  onBlurAmount = (e) => {
    const amount = parseFloat(e.target.value || 0).toFixed(2);
    e.target.value = amount;
  }

  onChangeOwner = () => {
    const { dispatch } = this.props;
    dispatch(change('payment-many-modal', 'method', null));
  }

  render() {
    const {
      accounts,
      action,
      balance,
      commentRequired,
      currentValues: {
        amount,
        notify,
        ownerId
      },
      data,
      feefines,
      handleSubmit,
      intl: { formatMessage },
      invalid,
      label,
      open,
      owners,
      pristine,
      submitting,
    } = this.props;

    let showNotify = false;
    accounts.forEach(a => {
      const feefine = feefines.find(f => f.id === a.feeFineId) || {};
      const owner = owners.find(o => o.id === a.ownerId) || {};
      if (feefine.actionNoticeId || owner.defaultActionNoticeId) {
        showNotify = true;
      }
    });

    const selected = calculateSelectedAmount(accounts);
    const remaining = amount > 0 ? parseFloat(balance - amount).toFixed(2) : parseFloat(balance).toFixed(2);
    const staffPlaceholder = formatMessage({
      id: 'ui-users.accounts.placeholder.additional'
    },
    {
      action: formatMessage({ id: `ui-users.accounts.actions.${action}` }),
      type: formatMessage({ id: `ui-users.accounts.${(commentRequired) ? 'required' : 'optional'}` })
    });

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
        <form>
          <Row>
            <Col xs>{this.renderModalLabel()}</Col>
          </Row>
          <br />
          <Row>
            <Col xs={5}>
              <Row end="xs">
                <Col xs={7}>
                  <FormattedMessage id="ui-users.accounts.totalOwed" />
                  {':'}
                </Col>
                <Col xs={4}>
                  {balance}
                </Col>
              </Row>
              <Row end="xs">
                <Col xs={7}>
                  <FormattedMessage id="ui-users.accounts.selectedAmount" />
                  {':'}
                </Col>
                <Col xs={4}>
                  {selected}
                </Col>
              </Row>
              <Row end="xs">
                <Col xs={7}>
                  <b>
                    <FormattedMessage id={`ui-users.accounts.${action}.amount`} />
                    {'*:'}
                  </b>
                </Col>
                <Col xs={4} className={css.customCol}>
                  <div>
                    <Field
                      id="amount"
                      name="amount"
                      component={TextField}
                      hasClearIcon={false}
                      onBlur={this.onBlurAmount}
                      fullWidth
                      marginBottom0
                      autoFocus
                      required
                    />
                  </div>
                </Col>
              </Row>
              <Row end="xs">
                <Col xs={7}>
                  <FormattedMessage id="ui-users.accounts.remainingAmount" />
                  {':'}
                </Col>
                <Col xs={4}>
                  {remaining}
                </Col>
              </Row>
            </Col>
            {(this.isPaymentAction(action) && accounts.length > 1) &&
              <Col xs={4}>
                <Row>
                  <Col xs>
                    <FormattedMessage id="ui-users.accounts.payment.field.ownerDesk" />
                    {'*'}
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
                placeholder={staffPlaceholder}
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
                onClick={handleSubmit}
                disabled={pristine || submitting || invalid}
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

const ActionModalRedux = reduxForm({
  enableReinitialize: true,
  validate,
})(ActionModal);

const selector = (form, ...other) => (formValueSelector(form))(...other);

export default connect((state, { form }) => ({
  currentValues: selector(
    form,
    state,
    'amount',
    'notify',
    'ownerId'
  )
}))(ActionModalRedux);

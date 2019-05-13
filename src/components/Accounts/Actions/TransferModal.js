import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Field,
  reduxForm,
  change,
} from 'redux-form';

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

import { isEqual } from 'lodash';
import css from './PayWaive.css';

const validate = (values, props) => {
  const accounts = props.accounts || [];
  let selected = 0;
  accounts.forEach(a => {
    selected += (a.remaining * 100);
  });
  selected /= 100;
  const errors = {};
  if (!values.amount) {
    errors.amount = <FormattedMessage id="ui-users.accounts.error.field" />;
  }
  if (values.amount <= 0) {
    errors.amount = <FormattedMessage id="ui-users.accounts.transfer.error.amount" />;
  }
  if (!values.account) {
    errors.account = <FormattedMessage id="ui-users.accounts.error.select" />;
  }
  if (props.commentRequired && !values.comment) {
    errors.comment = <FormattedMessage id="ui-users.accounts.error.comment" />;
  }
  if (parseFloat(values.amount) > parseFloat(selected)) {
    errors.amount = <FormattedMessage id="ui-users.accounts.transfer.error.exceeds" />;
  }
  return errors;
};

const asyncValidate = (values, dispatch, props, blurredField) => {
  if (blurredField === 'amount') {
    const amount = parseFloat(values.amount || 0).toFixed(2);
    dispatch(change('transfer', 'amount', amount));
  }
  return new Promise(resolve => resolve());
};

class TransferModal extends React.Component {
  static propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    handleSubmit: PropTypes.func,
    accounts: PropTypes.arrayOf(PropTypes.object),
    transfers: PropTypes.arrayOf(PropTypes.object),
    balance: PropTypes.number,
    initialize: PropTypes.func,
    pristine: PropTypes.bool,
    invalid: PropTypes.bool,
    submitting: PropTypes.bool,
    reset: PropTypes.func,
    commentRequired: PropTypes.bool,
  };


  constructor(props) {
    super(props);
    this.state = {
      transfer: 0,
    };
    this.onChangeAmount = this.onChangeAmount.bind(this);
    this.initialAmount = 0;
  }

  shouldComponentUpdate(nextProps, nextState) {
    const {
      accounts,
      open,
      pristine,
      invalid,
      initialize,
    } = this.props;

    if (!isEqual(accounts, nextProps.accounts)) {
      const selected = this.calculateSelectedAmount(nextProps.accounts);

      this.setState({
        transfer: selected,
        notify: true,
      });
      this.initialAmount = selected;

      initialize({
        amount: parseFloat(selected).toFixed(2),
        notify: 'true',
      });
    }
    return (
      accounts !== nextProps.accounts
      || this.state !== nextState
      || open !== nextProps.open
      || pristine !== nextProps.pristine
      || invalid !== nextProps.invalid
    );
  }

  onChangeAmount(e) {
    if (e.target.value === '') {
      this.setState({ transfer: 0.00 });
    } else {
      this.setState({ transfer: parseFloat(e.target.value) });
    }
  }

  onToggleNotify = () => {
    this.setState(prevState => ({
      notify: !prevState.notify,
    }));
  }

  calculateSelectedAmount(accounts) {
    return accounts.reduce((selected, { remaining }) => {
      return selected + (parseFloat(remaining) * 100);
    }, 0) / 100;
  }

  renderFormMessage() {
    const {
      accounts = [],
    } = this.props;

    const selected = this.calculateSelectedAmount(accounts);
    const transferAmount = this.state.transfer === ''
      ? 0.00
      : this.state.transfer;

    const transferType = this.state.transfer < selected
      ? <FormattedMessage id="ui-users.accounts.transfer.summary.partiallyTransfer" />
      : <FormattedMessage id="ui-users.accounts.transfer.summary.transferring" />;
    const feeFineForm = accounts.length === 1
      ? <FormattedMessage id="ui-users.accounts.feeFine" />
      : <FormattedMessage id="ui-users.accounts.feesFines" />;

    const transfer = <b>{parseFloat(transferAmount).toFixed(2)}</b>;
    const account = <b>{accounts.length}</b>;

    return (
      <FormattedMessage
        id="ui-users.accounts.transfer.summary"
        values={{
          feesFinesAmount: account,
          transferAmount: transfer,
          transferType,
          feeFineForm,
        }}
      />
    );
  }

  onCancel = () => {
    const {
      onClose,
      reset,
    } = this.props;

    onClose();
    reset();
  };

  onSubmit = () => {
    const {
      handleSubmit,
    } = this.props;

    handleSubmit();
    this.setState({
      transfer: this.initialAmount,
    });
  };

  render() {
    const {
      accounts,
      commentRequired,
      transfers,
      submitting,
      invalid,
      pristine,
      balance: totalAmount,
    } = this.props;

    const selected = this.calculateSelectedAmount(accounts);
    const remaining = totalAmount - this.state.transfer;
    const accountSelectOptions = transfers.map(p => ({ id: p.id, label: p.accountName }));
    const message = this.renderFormMessage();
    const placeholderTranslationId = commentRequired
      ? 'ui-users.accounts.transfer.placeholder.additional.required'
      : 'ui-users.accounts.transfer.placeholder.additional.optional';

    const submitButtonDisabled = pristine || submitting || invalid;
    return (
      <Modal
        id="transfer-modal"
        open={this.props.open}
        label={<FormattedMessage id="ui-users.accounts.transfer.modalLabel" />}
        onClose={this.props.onClose}
        size="medium"
        dismissible
      >
        <form>
          <Row>
            <Col xs>{message}</Col>
          </Row>
          <br />
          <Row>
            <Col xs={5}>
              <Row end="xs">
                <Col xs={7}>
                  <FormattedMessage id="ui-users.accounts.transfer.field.totalOwed" />
                  {':'}
                </Col>
                <Col xs={4}>
                  {parseFloat(totalAmount).toFixed(2)}
                </Col>
              </Row>
              <Row end="xs">
                <Col xs={7}>
                  <FormattedMessage id="ui-users.accounts.transfer.field.selectedAmount" />
                  {':'}
                </Col>
                <Col xs={4}>
                  {selected.toFixed(2)}
                </Col>
              </Row>
              <Row end="xs">
                <Col xs={6}>
                  <b>
                    <FormattedMessage id="ui-users.accounts.transfer.field.transferAmount" />
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
                      onChange={this.onChangeAmount}
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
                  <FormattedMessage id="ui-users.accounts.transfer.field.remainingAmount" />
                  {':'}
                </Col>
                <Col xs={4}>{remaining.toFixed(2)}</Col>
              </Row>
            </Col>
            <Col xs={7}>
              <Row>
                <Col xs>
                  <FormattedMessage id="ui-users.accounts.transfer.field.transferAccount" />
                  {'*'}
                </Col>
              </Row>
              <Row>
                <Col xs>
                  <FormattedMessage id="ui-users.accounts.transfer.placeholder.selectAccount">
                    {placeholder => (
                      <Field
                        id="account"
                        name="account"
                        component={Select}
                        dataOptions={accountSelectOptions}
                        placeholder={placeholder}
                      />
                    )}
                  </FormattedMessage>
                </Col>
              </Row>
            </Col>
          </Row>
          <br />
          <br />
          <Row>
            <Col xs>
              <FormattedMessage id="ui-users.accounts.transfer.field.comment" />
              {(this.props.commentRequired) ? '*' : ''}
            </Col>
          </Row>
          <br />
          <Row>
            <Col xs>
              <FormattedMessage id={placeholderTranslationId}>
                {placeholder => (
                  <Field
                    id="comment"
                    name="comment"
                    component={TextArea}
                    placeholder={placeholder}
                  />
                )}
              </FormattedMessage>
            </Col>
          </Row>
          <Row>
            <Col xs>
              <Field
                id="notify"
                name="notify"
                component={Checkbox}
                checked={this.state.notify}
                onChange={this.onToggleNotify}
                inline
              />
              <FormattedMessage id="ui-users.accounts.transfer.field.notifyPatron" />
            </Col>
          </Row>
          <Row end="xs">
            <Col>
              <Button
                id="cancel-button"
                onClick={this.onCancel}
              >
                <FormattedMessage id="ui-users.accounts.transfer.field.cancel" />
              </Button>
              <Button
                id="submit-button"
                buttonStyle="primary"
                onClick={this.onSubmit}
                disabled={submitButtonDisabled}
              >
                <FormattedMessage id="ui-users.accounts.transfer.field.transfer" />
              </Button>
            </Col>
          </Row>
        </form>
      </Modal>
    );
  }
}

export default reduxForm({
  form: 'transfer',
  fields: [],
  asyncBlurFields: ['amount'],
  asyncValidate,
  validate,
})(TransferModal);

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

const validate = (values, props) => {
  const accounts = props.accounts || [];
  let selected = parseFloat(0);
  accounts.forEach(a => {
    selected += parseFloat(a.remaining);
  });

  const errors = {};
  if (!values.amount) {
    errors.amount = <FormattedMessage id="ui-users.accounts.error.field" />;
  }
  if (values.amount < 0) {
    errors.amount = <FormattedMessage id="ui-users.accounts.pay.error.amount" />;
  }
  if (!values.method) {
    errors.method = 'Select one';
  }
  if (props.commentRequired && !values.comment) {
    errors.comment = <FormattedMessage id="ui-users.accounts.error.comment" />;
  }
  if (values.amount > selected) {
    errors.amount = <FormattedMessage id="ui-users.accounts.error.exceeds" />;
  }
  return errors;
};

class PayModal extends React.Component {
  static propTypes = {
    onClose: PropTypes.func,
    handleSubmit: PropTypes.func,
    open: PropTypes.bool,
    accounts: PropTypes.arrayOf(PropTypes.object),
    payments: PropTypes.arrayOf(PropTypes.object),
    balance: PropTypes.number,
    initialize: PropTypes.func,
    submitting: PropTypes.bool,
    invalid: PropTypes.bool,
    pristine: PropTypes.bool,
    reset: PropTypes.func,
    dispatch: PropTypes.func,
    commentRequired: PropTypes.bool,
  };

  constructor(props) {
    super(props);

    this.state = {
      amount: 0,
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (JSON.stringify(this.props.accounts) !== JSON.stringify(nextProps.accounts)) {
      const accounts = nextProps.accounts || [];
      let selected = parseFloat(0);
      accounts.forEach(a => {
        selected += parseFloat(a.remaining);
      });
      this.setState({
        amount: parseFloat(selected).toFixed(2),
      });
      this.props.initialize({ amount: selected, notify: true });
    }

    return (this.props.accounts !== nextProps.accounts
      || this.state !== nextState ||
      this.props.open !== nextProps.open ||
      this.props.pristine !== nextProps.pristine ||
      this.props.invalid !== nextProps.invalid);
  }

  onChangeAmount = (e) => {
    this.setState({
      amount: e.target.value,
    });
  }

  onClose = () => {
    const {
      onClose,
      reset,
    } = this.props;

    onClose();
    reset();
  }

  onSubmit = () => {
    const {
      handleSubmit,
      onClose,
      reset,
    } = this.props;

    handleSubmit();
    onClose();
    reset();
  }

  calculateSelectedAmount() {
    const { accounts } = this.props;
    return accounts.reduce((selected, { remaining }) => {
      return selected + parseFloat(remaining);
    }, 0);
  }

  renderFormMessage() {
    const {
      accounts = [],
    } = this.props;

    const { amount } = this.state;

    const selected = this.calculateSelectedAmount();
    const payAmount = amount === ''
      ? 0.00
      : amount;

    const payType = amount < selected
      ? <FormattedMessage id="ui-users.accounts.pay.summary.partiallyPay" />
      : <FormattedMessage id="ui-users.accounts.pay.summary.paying" />;

    const feeFineForm = accounts.length === 1
      ? <FormattedMessage id="ui-users.accounts.feeFine" />
      : <FormattedMessage id="ui-users.accounts.feesFines" />;

    return (
      <FormattedMessage
        id="ui-users.accounts.pay.summary"
        values={{
          feesFinesAmount: accounts.length,
          payAmount: parseFloat(payAmount).toFixed(2),
          payType,
          feeFineForm,
        }}
      />
    );
  }

  render() {
    const {
      submitting,
      invalid,
      pristine,
      onClose,
      open,
      commentRequired,
      balance: totalAmount,
    } = this.props;

    const { amount } = this.state;

    const selected = this.calculateSelectedAmount();
    const remaining = parseFloat(totalAmount - amount).toFixed(2);
    const payments = this.props.payments.map(p => ({ id: p.id, label: p.nameMethod }));

    const placeholderTranslationId = commentRequired
      ? 'ui-users.accounts.pay.placeholder.additional.required'
      : 'ui-users.accounts.pay.placeholder.additional.optional';

    const submitButtonDisabled = pristine || submitting || invalid;
    return (
      <Modal
        open={open}
        label={<FormattedMessage id="ui-users.accounts.pay.payFeeFine" />}
        onClose={onClose}
        size="medium"
        dismissible
      >
        <form>
          <Row>
            <Col xs>{this.renderFormMessage()}</Col>
          </Row>
          <br />
          <Row>
            <Col xs={5}>
              <Row>
                <Col xs={7}><FormattedMessage id="ui-users.accounts.pay.field.totalamount" /></Col>
                <Col xs={4}>{parseFloat(totalAmount).toFixed(2)}</Col>
              </Row>
              <Row>
                <Col xs={7}><FormattedMessage id="ui-users.accounts.pay.field.selectedamount" /></Col>
                <Col xs={4}>{parseFloat(selected).toFixed(2)}</Col>
              </Row>
              <Row>
                <Col xs={7}>
                  <b><FormattedMessage id="ui-users.accounts.pay.field.paymentamount" /></b>
                  :
                </Col>
                <Col xs={4.5}>
                  <Field
                    name="amount"
                    component={TextField}
                    onChange={this.onChangeAmount}
                    onBlur={(e, value, next) => {
                      this.props.dispatch(change('payment', 'amount', parseFloat(next).toFixed(2)));
                    }}
                    fullWidth
                    autoFocus
                    required
                  />
                </Col>
              </Row>
              <Row>
                <Col xs={7}><FormattedMessage id="ui-users.accounts.pay.field.remainingamount" /></Col>
                <Col xs={4}>{remaining}</Col>
              </Row>
            </Col>
            <Col xs={3}>
              <Row><Col xs><FormattedMessage id="ui-users.accounts.pay.field.paymentmethod" /></Col></Row>
              <Row>
                <Col xs>
                  <Field
                    name="method"
                    component={Select}
                    dataOptions={payments}
                    placeholder="Select type"
                  />
                </Col>
              </Row>
            </Col>
            <Col xs={4}>
              <Row><Col xs><FormattedMessage id="ui-users.accounts.pay.field.transactioninfo" /></Col></Row>
              <Row>
                <Col xs>
                  <Field
                    name="transaction"
                    component={TextField}
                    placeholder="Enter check #, etc."
                  />
                </Col>
              </Row>
            </Col>
          </Row>
          <br />
          <br />
          <Row>
            <Col xs>
              <FormattedMessage id="ui-users.accounts.pay.field.comment" />
              {(this.props.commentRequired) ? '*' : ''}
            </Col>
          </Row>
          <br />
          <Row>
            <Col xs>
              <FormattedMessage id={placeholderTranslationId}>
                {placeholder => (
                  <Field
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
                name="notify"
                component={Checkbox}
                inline
              />
              <FormattedMessage id="ui-users.accounts.pay.notifyPatron" />
            </Col>
          </Row>
          <br />
          <Row>
            <Col xs>
              <Button onClick={this.onClose}>
                <FormattedMessage id="ui-users.accounts.pay.cancel" />
              </Button>
              <Button
                buttonStyle="primary"
                onClick={this.onSubmit}
                disabled={submitButtonDisabled}
              >
                <FormattedMessage id="ui-users.accounts.pay.pay" />
              </Button>
            </Col>
          </Row>
        </form>
      </Modal>
    );
  }
}

export default reduxForm({
  form: 'payment',
  fields: [],
  validate,
})(PayModal);

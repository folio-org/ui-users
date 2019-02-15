import _ from 'lodash';
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
    errors.method = <FormattedMessage id="ui-users.accounts.error.select" />;
  }
  if (props.commentRequired && !values.comment) {
    errors.comment = <FormattedMessage id="ui-users.accounts.error.comment" />;
  }
  if (parseFloat(values.amount) > parseFloat(selected)) {
    errors.amount = <FormattedMessage id="ui-users.accounts.error.exceeds" />;
  }
  return errors;
};

const onChange = (values, dispatch, props, prevValues) => {
  if (values.ownerId !== prevValues.ownerId) {
    dispatch(change('payment-many', 'method', null));
  }
};

const asyncValidate = (values, dispatch, props, blurredField) => {
  if (blurredField === 'amount') {
    const amount = parseFloat(values.amount || 0).toFixed(2);
    dispatch(change('payment-many', 'amount', amount));
  }
  return new Promise(resolve => resolve());
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
    commentRequired: PropTypes.bool,
    owners: PropTypes.arrayOf(PropTypes.object),
  };

  constructor(props) {
    super(props);

    this.state = {
      amount: 0,
      notify: true,
    };
    this.initialAmount = 0;
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (!_.isEqual(this.props.accounts, nextProps.accounts)) {
      const accounts = nextProps.accounts || [];
      let selected = parseFloat(0);
      accounts.forEach(a => {
        selected += parseFloat(a.remaining);
      });
      this.setState({
        amount: parseFloat(selected).toFixed(2),
      });
      this.initialAmount = parseFloat(selected).toFixed(2);
      this.props.initialize({ amount: parseFloat(selected).toFixed(2), notify: true });
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

  onToggleNotify = () => {
    this.setState(prevState => ({
      notify: !prevState.notify,
    }));
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
      reset,
    } = this.props;

    handleSubmit();
    reset();
    this.setState({ amount: this.initialAmount });
  }

  onChangeOwner = (e) => {
    this.setState({
      ownerId: e.target.value,
    });
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

    const pay = <b>{parseFloat(payAmount).toFixed(2)}</b>;
    const account = <b>{accounts.length}</b>;


    return (
      <FormattedMessage
        id="ui-users.accounts.pay.summary"
        values={{
          feesFinesAmount: account,
          payAmount: pay,
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
      owners,
      payments,
      commentRequired,
      balance: totalAmount,
    } = this.props;

    const { amount, ownerId } = this.state;

    const selected = this.calculateSelectedAmount();
    const remaining = parseFloat(totalAmount - amount).toFixed(2);
    const dataOptions = payments.filter(p => p.ownerId === ownerId).map(p => ({ id: p.id, label: p.nameMethod }));
    const ownerOptions = owners.map(o => ({ value: o.id, label: o.owner }));

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
            <Col xs={4.5}>
              <Row end="xs">
                <Col xs={7} style={{ marginRight: '5px' }}>
                  <FormattedMessage id="ui-users.accounts.pay.field.totalamount" />
:
                </Col>
                <Col xs={4} style={{ marginRight: '5px' }}>
                  {parseFloat(totalAmount).toFixed(2)}
                </Col>
              </Row>
              <Row end="xs">
                <Col xs={7} style={{ marginRight: '5px' }}>
                  <FormattedMessage id="ui-users.accounts.pay.field.selectedamount" />
:
                </Col>
                <Col xs={4}>
                  {parseFloat(selected).toFixed(2)}
                </Col>
              </Row>
              <Row end="xs">
                <Col xs={7} style={{ marginRight: '10px' }}>
                  <b>
                    <FormattedMessage id="ui-users.accounts.pay.field.paymentamount" />
:
                  </b>
                </Col>
                <Col xs={4} style={{ marginRight: '5px' }}>
                  <div dir="rtl">
                    <Field
                      name="amount"
                      component={TextField}
                      onChange={this.onChangeAmount}
                      hasClearIcon={false}
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
                  <FormattedMessage id="ui-users.accounts.pay.field.remainingamount" />
:
                </Col>
                <Col xs={4}>
                  {remaining}
                </Col>
              </Row>
            </Col>
            <Col xs={4}>
              <Row><Col xs><FormattedMessage id="ui-users.accounts.pay.field.ownerDesk" /></Col></Row>
              <Row>
                <Col xs>
                  <FormattedMessage id="ui-users.accounts.pay.owner.placeholder">
                    {placeholder => (
                      <Field
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
            <Col xs={3}>
              <Row><Col xs><FormattedMessage id="ui-users.accounts.pay.field.paymentmethod" /></Col></Row>
              <Row>
                <Col xs>
                  <FormattedMessage id="ui-users.accounts.pay.method.placeholder">
                    {placeholder => (
                      <Field
                        name="method"
                        component={Select}
                        dataOptions={dataOptions}
                        placeholder={placeholder}
                      />
                    )}
                  </FormattedMessage>
                </Col>
              </Row>
            </Col>
          </Row>
          <br />
          <Row>
            <Col xs={4}>
              <Row><Col xs><FormattedMessage id="ui-users.accounts.pay.field.transactioninfo" /></Col></Row>
              <Row>
                <Col xs>
                  <FormattedMessage id="ui-users.accounts.pay.transaction.placeholder">
                    {placeholder => (
                      <Field
                        name="transaction"
                        component={TextField}
                        placeholder={placeholder}
                      />
                    )}
                  </FormattedMessage>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row>
            <Col xs>
              <FormattedMessage id="ui-users.accounts.pay.field.comment" />
              {(this.props.commentRequired) ? '*' : ''}
            </Col>
          </Row>
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
                checked={this.state.notify}
                onChange={this.onToggleNotify}
                inline
              />
              <FormattedMessage id="ui-users.accounts.pay.notifyPatron" />
            </Col>
          </Row>
          <br />
          {this.state.notify &&
            <div>
              <Row>
                <Col xs>
                  <FormattedMessage id="ui-users.accounts.pay.field.infoPatron" />
                  {(this.props.commentRequired) ? '*' : ''}
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
          <br />
          <Row end="xs">
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
  form: 'payment-many',
  fields: [],
  asyncBlurFields: ['amount'],
  asyncValidate,
  onChange,
  validate,
})(PayModal);

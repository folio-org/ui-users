import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field, reduxForm, change } from 'redux-form';
import Modal from '@folio/stripes-components/lib/Modal';
import Button from '@folio/stripes-components/lib/Button';
import Checkbox from '@folio/stripes-components/lib/Checkbox';
import TextArea from '@folio/stripes-components/lib/TextArea';
import TextField from '@folio/stripes-components/lib/TextField';
import Select from '@folio/stripes-components/lib/Select';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';

const validate = (values, props) => {
  const accounts = props.accounts || [];
  let selected = parseFloat(0);
  accounts.forEach(a => {
    selected += parseFloat(a.remaining);
  });

  const errors = {};
  if (!values.amount) {
    errors.amount = 'Please fill this field in to continue';
  }
  if (values.amount < 0) {
    errors.amount = 'Payment must be > 0';
  }
  if (!values.method) {
    errors.method = 'Select one';
  }
  if (props.commentRequired && !values.comment) {
    errors.comment = 'Enter a comment';
  }
  if (values.amount > selected) {
    errors.amount = 'Pay amount exceeds the selected amount';
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
    commentRequired: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.state = {
      amount: 0,
    };

    this.onChangeAmount = this.onChangeAmount.bind(this);
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

  onChangeAmount(e) {
    this.setState({
      amount: e.target.value,
    });
  }

  render() {
    const accounts = this.props.accounts || [];
    const n = accounts.length || 0;
    const totalamount = this.props.balance;
    let selected = parseFloat(0);
    accounts.forEach(a => {
      selected += parseFloat(a.remaining);
    });
    parseFloat(selected).toFixed(2);
    const remaining = parseFloat(totalamount - this.state.amount).toFixed(2);
    const payments = this.props.payments.map(p => ({ id: p.id, label: p.nameMethod }));
    const { submitting, invalid, pristine } = this.props;
    const paymentAmount = this.state.amount === '' ? 0.00 : this.state.amount;
    const message = `${(this.state.amount < selected) ? 'Partially paying' : 'Paying'} ${n} ${(n === 1) ? 'fee/fine' : 'fees/fines'} for a total amount of ${parseFloat(paymentAmount).toFixed(2)}`;
    const additional = 'Enter more information about the fee/fine payment';
    const comment = `${additional} ${(this.props.commentRequired) ? '(required)' : '(optional)'}`;

    return (
      <Modal
        open={this.props.open}
        label="Pay Fee/Fine"
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
              <Row>
                <Col xs={7}><FormattedMessage id="ui-users.accounts.pay.field.totalamount" /></Col>
                <Col xs={4}>{parseFloat(totalamount).toFixed(2)}</Col>
              </Row>
              <Row>
                <Col xs={7}><FormattedMessage id="ui-users.accounts.pay.field.selectedamount" /></Col>
                <Col xs={4}>{parseFloat(selected).toFixed(2)}</Col>
              </Row>
              <Row>
                <Col xs={7}><b><FormattedMessage id="ui-users.accounts.pay.field.paymentamount" /></b>:</Col>
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
              <Row><Col xs><FormattedMessage id="ui-users.accounts.pay.field.trasactioninfo" /></Col></Row>
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
              <Field
                name="comment"
                component={TextArea}
                placeholder={comment}
              />
            </Col>
          </Row>
          <Row>
            <Col xs>
              <Field
                name="notify"
                component={Checkbox}
                inline
              />
              {' Notify patron'}
            </Col>
          </Row>
          <br />
          <Row>
            <Col xs>
              <Button onClick={() => { this.props.onClose(); this.props.reset(); }}>Cancel</Button>
              <Button buttonStyle="primary" onClick={() => { this.props.handleSubmit(); this.props.onClose(); this.props.reset(); }} disabled={pristine || submitting || invalid}>Pay</Button>
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

import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import Modal from '@folio/stripes-components/lib/Modal';
import Button from '@folio/stripes-components/lib/Button';
import Checkbox from '@folio/stripes-components/lib/Checkbox';
import TextArea from '@folio/stripes-components/lib/TextArea';
import TextField from '@folio/stripes-components/lib/TextField';
import Select from '@folio/stripes-components/lib/Select';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';

const validate = (values, props) => {
  const errors = {};
  if (!values.amount) {
    errors.amount = 'Please fill this field in to continue';
  }
  if (!values.method) {
    errors.method = 'Select one';
  }
  if (props.commentRequired && !values.comment) {
    errors.comment = 'Enter a comment';
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
    this.amount = 0;
    this.onChangeAmount = this.onChangeAmount.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (this.props.accounts !== prevProps.accounts) {
      const accounts = this.props.accounts || [];
      let selected = 0;
      accounts.forEach(a => {
        selected += a.remaining;
      });
      this.amount = selected;
      this.props.initialize({ amount: selected, notify: true });
    }
  }

  onChangeAmount(e) {
    this.amount = e.target.value;
  }

  render() {
    const accounts = this.props.accounts || [];
    const n = accounts.length || 0;
    const totalamount = this.props.balance;
    let selected = 0;
    accounts.forEach(a => {
      selected += a.remaining;
    });
    const remaining = parseFloat(totalamount - selected).toFixed(2);
    const payments = this.props.payments.map(p => ({ id: p.id, label: p.nameMethod }));
    const { submitting, invalid, pristine } = this.props;
    const message = `${(this.amount < selected) ? 'Partialy paying' : 'Paying'} ${n} ${(n === 1) ? 'fee/fine' : 'fees/fines'} for a total amount of ${selected}`;

    return (
      <Modal
        open={this.props.open}
        label="Pay Fee(s)/Fine(s)"
        onClose={this.props.onClose}
        size="medium"
        dismissible
      >
        <form>
          <Row>
            <Col xs><span style={{ color: '#5858FA' }}>{message}</span></Col>
          </Row>
          <br />
          <Row>
            <Col xs={4}>
              <Row>
                <Col xs={8}>Total Owed Amount</Col>
                <Col xs={4}>{totalamount}</Col>
              </Row>
              <Row>
                <Col xs={8}>Selected Amount</Col>
                <Col xs={4}>{selected}</Col>
              </Row>
              <Row>
                <Col xs={8}>Pay Amount*</Col>
                <Col xs={4}>
                  <Field
                    name="amount"
                    component={TextField}
                    onChange={this.onChangeAmount}
                    fullWidth
                    required
                  />
                </Col>
              </Row>
              <Row>
                <Col xs={8}>Remaining Amount</Col>
                <Col xs={4}>{remaining}</Col>
              </Row>
            </Col>
            <Col xs={4}>
              <Row><Col xs>Payment Method*</Col></Row>
              <Row>
                <Col xs>
                  <Field
                    name="method"
                    component={Select}
                    dataOptions={payments}
                    placeholder="Select One"
                  />
                </Col>
              </Row>
            </Col>
            <Col xs={4}>
              <Row><Col xs>Transaction Info</Col></Row>
              <Row>
                <Col xs>
                  <Field
                    name="transaction"
                    component={TextField}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
          <br /><br />
          <Row>
            <Col xs>Comment{(this.props.commentRequired) ? '*' : ''}</Col>
          </Row>
          <br />
          <Row>
            <Col xs>
              <Field
                name="comment"
                component={TextArea}
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
              <Button buttonStyle="primary" onClick={() => { this.props.handleSubmit(); this.props.reset(); }} disabled={pristine || submitting || invalid}>Pay</Button>
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


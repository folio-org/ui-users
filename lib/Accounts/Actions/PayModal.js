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

class PayModal extends React.Component {
  static propTypes = {
    onClose: PropTypes.func,
    handleSubmit: PropTypes.func,
    open: PropTypes.bool,
    accounts: PropTypes.arrayOf(PropTypes.object),
  };

  render() {
    const n = this.props.accounts.length || 0;
    const totalamount = 0;
    const total = 0;
    const selected = 0;
    const pay = 0;
    const remaining = 0;

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
            <Col xs><span style={{ color: '#5858FA' }}>{`Paying ${n} fees/fines for a total amount of ${totalamount}`}</span></Col>
          </Row>
          <br />
          <Row>
            <Col xs={4}>
              <Row>
                <Col xs={8}>Total Owed Amount</Col>
                <Col xs={4}>{total}</Col>
              </Row>
              <Row>
                <Col xs={8}>Selected Amount</Col>
                <Col xs={4}>{selected}</Col>
              </Row>
              <Row>
                <Col xs={8}>Pay Amount*</Col>
                <Col xs={4}>{pay}</Col>
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
                    dataOptions={[{ id: 0, label: 'Cash' }, { id: 1, label: 'Check' }]}
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
            <Col xs>Comment</Col>
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
              <Button onClick={this.props.onClose}>Cancel</Button>
              <Button buttonStyle="primary" onClick={this.props.handleSubmit} >Pay</Button>
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
})(PayModal);

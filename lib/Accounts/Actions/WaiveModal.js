import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import Modal from '@folio/stripes-components/lib/Modal';
import Button from '@folio/stripes-components/lib/Button';
import Checkbox from '@folio/stripes-components/lib/Checkbox';
import TextArea from '@folio/stripes-components/lib/TextArea';
import Select from '@folio/stripes-components/lib/Select';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';

class WaiveModal extends React.Component {
  static propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    handleSubmit: PropTypes.func,
    accounts: PropTypes.arrayOf(PropTypes.object),
  };

  render() {
    const n = this.props.accounts.length || 0;
    const totalamount = 0;
    const total = 0;
    const selected = 0;
    const waive = 0;
    const remaining = 0;

    return (
      <Modal
        open={this.props.open}
        label="Waive Fee(s)/Fine(s)"
        onClose={this.props.onClose}
        size="medium"
        dismissible
      >
        <form>
          <Row>
            <Col xs><span style={{ color: '#5858FA' }}>{`Waiving ${n} fees/fines for a total amount of ${totalamount}`}</span></Col>
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
                <Col xs={8}>Waive Amount*</Col>
                <Col xs={4}>{waive}</Col>
              </Row>
              <Row>
                <Col xs={8}>Remaining Amount</Col>
                <Col xs={4}>{remaining}</Col>
              </Row>
            </Col>
            <Col xs={8}>
              <Row><Col xs>Waive Reason*</Col></Row>
              <Row>
                <Col xs>
                  <Field
                    name="reason"
                    component={Select}
                    dataOptions={[{ label: 'Patron sick', value: '0' }]}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
          <br />
          <br />
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
          <Row>
            <Col xs>
              <Button onClick={this.props.onClose}>Cancel</Button>
              <Button buttonStyle="primary" onClick={this.props.handleSubmit}>Waive</Button>
            </Col>
          </Row>
        </form>
      </Modal>
    );
  }
}

export default reduxForm({
  form: 'waive',
  fields: [],
})(WaiveModal);

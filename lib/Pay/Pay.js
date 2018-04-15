import React from 'react';
import PropTypes from 'prop-types';
import Button from '@folio/stripes-components/lib/Button';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import TextField from '@folio/stripes-components/lib/TextField';
import { Field, reduxForm } from 'redux-form';

const Pay = (props) => {
  const { account } = props;
  return (
    <form>
      <Row>
        <Col>Fee/Fine Type</Col>
        <Col>Charged</Col>
        <Col>Remaining</Col>
      </Row>
      <Row>
        <Col>{(account.feeFineType) ? account.feeFineType : ''}</Col>
        <Col>{(account.charged) ? account.charged : '0.0'}</Col>
        <Col>{(account.remainig) ? account.remainig : '0.0'}</Col>
      </Row>
      <Row>
        <Field
          name="payment"
          component={TextField}
        />
      </Row>
      <Row>
        <Button onClick={this.props.handleSubmit}>Pay</Button>
      </Row>
    </form>
  );
};

Pay.propTypes = {
  account: PropTypes.object,
};

export default reduxForm({
  form: 'payform', // a unique identifier for this form
  navigationCheck: true,
})(Pay);

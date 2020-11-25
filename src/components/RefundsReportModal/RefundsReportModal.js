import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Field } from 'react-final-form';
import { FormattedMessage } from 'react-intl';
import { isEmpty } from 'lodash';

import stripesFinalForm from '@folio/stripes/final-form';

import {
  Button,
  Col,
  Datepicker,
  Label,
  Modal,
  Row,
  ModalFooter,
} from '@folio/stripes/components';

import css from './RefundsReportModal.css';

const validate = ({ startDate, endDate }) => {
  const errors = {};
  
  if (isEmpty(startDate) && endDate) {
    errors.startDate = <FormattedMessage id="ui-users.reports.refunds.validation.startDate" />
  }

  if ((!isEmpty(startDate) && !isEmpty(endDate)) && (moment(startDate).isAfter(moment(endDate)))) {
    errors.endDate = <FormattedMessage id="ui-users.reports.refunds.validation.endDate" />;
  }

  return errors;
}

const RefundsReportModal = (props) => {
  const calculateSubmitState = () => {
    let disabled = true;

    const {
      dirty, 
      values: {
        startDate,
        endDate,
      },
      valid,
    } = props.form.getState();
    
    if (dirty && valid || (valid && !isEmpty(startDate) && !isEmpty(endDate))) {
      disabled = false;
    }

    return disabled;
  };

  const parseDate = (date) => {
    return moment(date).format('YYYY-MM-DD');
  };

  const footer = (
    <ModalFooter>
      <Button
        disabled={calculateSubmitState()}
        marginBottom0
        buttonStyle="primary"
        onClick={props.form.submit}
      >
        <FormattedMessage id="ui-users.saveAndClose" />
      </Button>
      <Button
        marginBottom0
        buttonStyle="default"
        onClick={props.onClose}
      >
        <FormattedMessage id="ui-users.cancel" />
      </Button>
    </ModalFooter>
  );

  return (
    <Modal
      id="refunds-report-modal"
      size="small"
      footer={footer}
      dismissible
      open
      label={props.label}
      onClose={props.onClose}
    >
      <form
        className={css.content}
        onSubmit={props.handleSubmit}
      >
        <Label>
          <FormattedMessage id="ui-users.reports.refunds.modal.message" />
        </Label>
        <Row>
          <Col xs={6}>
            <Field
              label={<FormattedMessage id="ui-users.reports.refunds.modal.startDate" />}
              name="startDate"
              component={Datepicker}
              autoFocus
              parse={parseDate}
            />
          </Col>
          <Col xs={6}>
            <Field
              label={<FormattedMessage id="ui-users.reports.refunds.modal.endDate" />}
              name="endDate"
              component={Datepicker}
              parse={parseDate}
            />
          </Col>
        </Row>
      </form>
    </Modal>
  );
};

RefundsReportModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  handleSubmit: PropTypes.func.isRequired,
};

export default stripesFinalForm({
  validate,
  subscription: { values: true },
})(RefundsReportModal);
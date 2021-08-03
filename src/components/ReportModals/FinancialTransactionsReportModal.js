import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import { Field } from 'react-final-form';
import { isEmpty } from 'lodash';
import {
  FormattedMessage,
  injectIntl,
} from 'react-intl';

import stripesFinalForm from '@folio/stripes/final-form';
import {
  Modal,
  Button,
  Row,
  Col,
  Datepicker,
  ModalFooter,
  MultiSelection,
  Select,
} from '@folio/stripes/components';

import { DATE_FORMAT } from '../../constants';
import css from './ReportModal.css';

export const validate = (options) => {
  const errors = {};
  const { startDate, endDate, feeFineOwner } = options;

  if (isEmpty(startDate) && isEmpty(endDate)) {
    errors.startDate = <FormattedMessage id="ui-users.reports.cash.drawer.report.startDate.error" />;
  }

  if (isEmpty(startDate) && !isEmpty(endDate)) {
    errors.startDate = <FormattedMessage id="ui-users.reports.cash.drawer.report.endDateWithoutStart.error" />;
  }

  if ((!isEmpty(startDate) && !isEmpty(endDate)) && (moment(startDate).isAfter(moment(endDate)))) {
    errors.endDate = <FormattedMessage id="ui-users.reports.cash.drawer.report.endDate.error" />;
  }

  if (!feeFineOwner) {
    errors.feeFineOwner = <FormattedMessage id="ui-users.reports.financial.trans.modal.owners.error" />;
  }

  return errors;
};

const FinancialTransactionsReportModal = (props) => {
  const { valid } = props.form.getState();
  const {
    values: { feeFineOwner: ownerValue = '' },
    owners,
  } = props;
  const parseDate = (date) => (date ? moment.tz(date, props.timezone).format(DATE_FORMAT) : date);
  const formattedOwners = owners.map(({ id, owner }) => ({
    value: id,
    label: owner,
  }));
  const selectedServicePoint = owners?.find(({ id }) => id === ownerValue) ?? {};
  const formattedServicePoints = selectedServicePoint?.servicePointOwner?.map(({ value, label }) => ({
    value,
    label,
  })) ?? [];

  const onChangeOwner = (feeFineOwner) => {
    const { form: { change } } = props;

    change('feeFineOwner', feeFineOwner);
    change('servicePoint', []);
  };

  const footer = (
    <ModalFooter>
      <Button
        disabled={!valid}
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
      data-test-financial-transactions-report-modal
      id="financial-transactions-report-modal"
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
        <Row>
          <Col xs={6}>
            <Field
              label={<FormattedMessage id="ui-users.reports.refunds.modal.startDate" />}
              name="startDate"
              required
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
          <Col xs={12}>
            <Field
              data-test-financial-transactions-report-owner
              name="feeFineOwner"
              component={Select}
              label={<FormattedMessage id="ui-users.reports.financial.trans.modal.owners" />}
              placeholder={props.intl.formatMessage({ id: 'ui-users.reports.financial.trans.modal.owners.placeholder' })}
              dataOptions={formattedOwners}
              onChange={(e) => onChangeOwner(e.target.value)}
              required
            />
          </Col>
          <Col xs={12}>
            <Field
              data-test-financial-transactions-report-servicePoint
              name="servicePoint"
              component={MultiSelection}
              label={<FormattedMessage id="ui-users.reports.financial.trans.modal.servicePoint" />}
              placeholder={props.intl.formatMessage({ id: 'ui-users.reports.financial.trans.modal.servicePoint.placeholder' })}
              dataOptions={formattedServicePoints}
              disabled={!ownerValue}
            />
          </Col>
        </Row>
      </form>
    </Modal>
  );
};

FinancialTransactionsReportModal.propTypes = {
  form: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired,
  label: PropTypes.string.isRequired,
  owners: PropTypes.arrayOf(PropTypes.object).isRequired,
  onClose: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  timezone: PropTypes.string.isRequired,
  values: PropTypes.object.isRequired,
};

export default stripesFinalForm({
  validate,
  subscription: { values: true },
})(injectIntl(FinancialTransactionsReportModal));

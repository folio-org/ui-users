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
  RadioButtonGroup,
  RadioButton,
  Label,
} from '@folio/stripes/components';

import { DATE_FORMAT } from '../../constants';

const validate = (options) => {
  const errors = {};
  const { startDate, endDate, servicePoint } = options;

  if (isEmpty(startDate) && isEmpty(endDate)) {
    errors.startDate = <FormattedMessage id="ui-users.reports.cash.drawer.report.startDate.error" />;
  }

  if (isEmpty(startDate) && !isEmpty(endDate)) {
    errors.startDate = <FormattedMessage id="ui-users.reports.cash.drawer.report.endDateWithoutStart.error" />;
  }

  if ((!isEmpty(startDate) && !isEmpty(endDate)) && (moment(startDate).isAfter(moment(endDate)))) {
    errors.endDate = <FormattedMessage id="ui-users.reports.cash.drawer.report.endDate.error" />;
  }

  if (!servicePoint) {
    errors.servicePoint = <FormattedMessage id="ui-users.reports.cash.drawer.report.servicePoint.error" />;
  }

  if (!options.format) {
    options.format = 'both';
  }

  return errors;
};

const CashDrawerReportModal = (props) => {
  const { valid } = props.form.getState();
  const { values: { servicePoint: servicePointsValue = '' } } = props;
  const sources = [];
  const parseDate = (date) => (date ? moment.tz(date, props.timezone).format(DATE_FORMAT) : date);
  const servicePoints = props.servicePoints.map(({ id, name }) => ({
    value: id,
    label: name,
  }));

  if (servicePointsValue) {
    // const feefineactions = resources?.feefineactions?.records ?? [];
    // const servicePointActions = feefineactions.filter((action) => action.createdAt === servicePointsValue);
    //
    // uniqBy(servicePointActions, 'source')
    //   .forEach((action) => sources.push({
    //     value: action.source, // should be source id
    //     label: action.source,
    //   }));

    // TODO: get list of all payments on chosen Service Point with unique sources
    // TODO: (we need name and id of source)
    // TODO: probably this list should come from BE
  }

  const footer = (
    <ModalFooter>
      <Button
        data-test-cash-drawer-report-save-btn
        disabled={!valid}
        marginBottom0
        buttonStyle="primary"
        onClick={props.form.submit}
      >
        <FormattedMessage id="ui-users.saveAndClose" />
      </Button>
      <Button
        data-test-cash-drawer-report-cancel-btn
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
      data-test-cash-drawer-report-modal
      id="cash-drawer-report-modal"
      size="small"
      footer={footer}
      dismissible
      open
      label={props.label}
      onClose={props.onClose}
    >
      <form onSubmit={props.handleSubmit}>
        <Row>
          <Col
            data-test-cash-drawer-report-start-date
            xs={6}
          >
            <Field
              label={<FormattedMessage id="ui-users.reports.refunds.modal.startDate" />}
              name="startDate"
              required
              component={Datepicker}
              autoFocus
              parse={parseDate}
            />
          </Col>
          <Col
            data-test-cash-drawer-report-end-date
            xs={6}
          >
            <Field
              label={<FormattedMessage id="ui-users.reports.refunds.modal.endDate" />}
              name="endDate"
              required
              component={Datepicker}
              parse={parseDate}
            />
          </Col>
          <Col
            data-test-cash-drawer-report-service-points
            xs={12}
          >
            <Field
              name="servicePoint"
              component={Select}
              label={<FormattedMessage id="ui-users.reports.cash.drawer.servicePoint" />}
              placeholder={props.intl.formatMessage({ id: 'ui-users.reports.cash.drawer.servicePoint.placeholder' })}
              dataOptions={servicePoints}
              required
            />
          </Col>
          <Col
            data-test-cash-drawer-report-sources
            xs={12}
          >
            <Field
              name="sources"
              component={MultiSelection}
              label={<FormattedMessage id="ui-users.reports.cash.drawer.sources" />}
              placeholder={props.intl.formatMessage({ id: 'ui-users.reports.cash.drawer.sources.placeholder' })}
              dataOptions={sources}
              disabled={!servicePointsValue}
            />
          </Col>
          <Col
            data-test-cash-drawer-report-formats
            xs={12}
          >
            <Label>
              <FormattedMessage id="ui-users.reports.cash.drawer.report.format" />
            </Label>
            <Field
              name="format"
              component={RadioButtonGroup}
            >
              <RadioButton
                label={<FormattedMessage id="ui-users.reports.cash.drawer.report.format.csv" />}
                id="csv-format"
                value="csv"
              />
              <RadioButton
                label={<FormattedMessage id="ui-users.reports.cash.drawer.report.format.pdf" />}
                id="pdf-format"
                value="pdf"
              />
              <RadioButton
                label={<FormattedMessage id="ui-users.reports.cash.drawer.report.format.both" />}
                id="both-format"
                value="both"
              />
            </Field>
          </Col>
        </Row>
      </form>
    </Modal>
  );
};

CashDrawerReportModal.propTypes = {
  form: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired,
  label: PropTypes.string.isRequired,
  servicePoints: PropTypes.arrayOf(PropTypes.object).isRequired,
  onClose: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  timezone: PropTypes.string.isRequired,
  values: PropTypes.object.isRequired,
  resources: PropTypes.shape({
    feefineactions: PropTypes.shape({
      records: PropTypes.arrayOf(PropTypes.object),
    }),
  }).isRequired,
};

export default stripesFinalForm({
  validate,
  subscription: { values: true },
})(injectIntl(CashDrawerReportModal));

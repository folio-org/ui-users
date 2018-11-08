import React from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';

import {
  TextField,
  Row,
  Col,
  Accordion,
  KeyValue,
  Datepicker,
  Headline
} from '@folio/stripes/components';

import PasswordControl from './PasswordControl';

const EditExtendedInfo = ({ expanded, onToggle, accordionId, initialValues }) => (
  <Accordion
    open={expanded}
    id={accordionId}
    onToggle={onToggle}
    label={<Headline size="large" tag="h3"><FormattedMessage id="ui-users.extended.extendedInformation" /></Headline>}
  >
    <Row>
      <Col xs={12} md={3}>
        <Field
          component={Datepicker}
          label={<FormattedMessage id="ui-users.extended.dateEnrolled" />}
          dateFormat="YYYY-MM-DD"
          name="enrollmentDate"
          id="adduser_enrollmentdate"
        />
      </Col>
      <Col xs={12} md={3}>
        <Field
          label={<FormattedMessage id="ui-users.extended.externalSystemId" />}
          name="externalSystemId"
          id="adduser_externalsystemid"
          component={TextField}
          fullWidth
        />
      </Col>
      <Col xs={12} md={3}>
        <Field
          component={Datepicker}
          label={<FormattedMessage id="ui-users.extended.birthDate" />}
          dateFormat="YYYY-MM-DD"
          name="personal.dateOfBirth"
          id="adduser_dateofbirth"
          timeZone="UTC"
          backendDateStandard="YYYY-MM-DD"
        />
      </Col>
      <Col xs={12} md={3}>
        <KeyValue label={<FormattedMessage id="ui-users.extended.folioNumber" />}>
          {initialValues.id || '-'}
        </KeyValue>
      </Col>
    </Row>
    <Row>
      <Col xs={12} md={3}>
        <Field
          label={<FormattedMessage id="ui-users.information.username" />}
          name="username"
          id="adduser_username"
          component={TextField}
          fullWidth
          validStylesEnabled
        />
      </Col>
      {!initialValues.id && <PasswordControl />}
    </Row>
    <br />
  </Accordion>
);

EditExtendedInfo.propTypes = {
  expanded: PropTypes.bool,
  onToggle: PropTypes.func,
  accordionId: PropTypes.string.isRequired,
  initialValues: PropTypes.object,
};

export default EditExtendedInfo;

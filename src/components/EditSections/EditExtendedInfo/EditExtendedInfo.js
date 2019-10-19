import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
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
import CreateResetPasswordControl from './CreateResetPasswordControl';

class EditExtendedInfo extends Component {
  static propTypes = {
    expanded: PropTypes.bool.isRequired,
    userId: PropTypes.string.isRequired,
    userEmail: PropTypes.string.isRequired,
    accordionId: PropTypes.string.isRequired,
    userFirstName: PropTypes.string.isRequired,
    onToggle: PropTypes.func.isRequired,
  };

  buildAccordionHeader = () => {
    return (
      <Headline
        size="large"
        tag="h3"
      >
        {<FormattedMessage id="ui-users.extended.extendedInformation" />}
      </Headline>
    );
  };

  render() {
    const {
      expanded,
      onToggle,
      accordionId,
      userId,
      userFirstName,
      userEmail,
    } = this.props;

    const accordionHeader = this.buildAccordionHeader();

    return (
      <Accordion
        open={expanded}
        id={accordionId}
        label={accordionHeader}
        onToggle={onToggle}
      >
        <Row>
          <Col
            xs={12}
            md={3}
          >
            <Field
              component={Datepicker}
              label={<FormattedMessage id="ui-users.extended.dateEnrolled" />}
              dateFormat="YYYY-MM-DD"
              name="enrollmentDate"
              id="adduser_enrollmentdate"
            />
          </Col>
          <Col
            xs={12}
            md={3}
          >
            <Field
              label={<FormattedMessage id="ui-users.extended.externalSystemId" />}
              name="externalSystemId"
              id="adduser_externalsystemid"
              component={TextField}
              fullWidth
            />
          </Col>
          <Col
            xs={12}
            md={3}
          >
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
          <Col
            xs={12}
            md={3}
          >
            <KeyValue label={<FormattedMessage id="ui-users.extended.folioNumber" />}>
              {userId || '-'}
            </KeyValue>
          </Col>
        </Row>
        <Row>
          <Col
            xs={12}
            md={3}
          >
            <Field
              label={<FormattedMessage id="ui-users.information.username" />}
              name="username"
              id="adduser_username"
              component={TextField}
              fullWidth
              validStylesEnabled
            />
          </Col>
          {
            userId
              ? (
                <CreateResetPasswordControl
                  userId={userId}
                  email={userEmail}
                  name={userFirstName}
                />
              )
              : <PasswordControl />
          }
        </Row>
        <br />
      </Accordion>
    );
  }
}

export default EditExtendedInfo;

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field } from 'redux-form';

import {
  TextField,
  Row,
  Col,
  Accordion,
  Label,
  Datepicker,
  Headline,
} from '@folio/stripes/components';
import { IfPermission } from '@folio/stripes/core';

import {
  addressTypesShape,
  departmentsShape,
} from '../../../../shapes';

import CreateResetPasswordControl from './CreateResetPasswordControl';
import RequestPreferencesEdit from './RequestPreferencesEdit';
import DepartmentsNameEdit from './DepartmentsNameEdit';

class EditExtendedInfo extends Component {
  static propTypes = {
    addressTypes: addressTypesShape,
    expanded: PropTypes.bool.isRequired,
    departments: departmentsShape,
    userId: PropTypes.string.isRequired,
    userEmail: PropTypes.string.isRequired,
    accordionId: PropTypes.string.isRequired,
    userFirstName: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    onToggle: PropTypes.func.isRequired,
  };

  buildAccordionHeader = () => {
    return (
      <Headline
        size="large"
        tag="h3"
      >
        <FormattedMessage id="ui-users.extended.extendedInformation" />
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
      username,
      addressTypes,
      departments,
    } = this.props;

    const accordionHeader = this.buildAccordionHeader();
    const isEditForm = !!userId;

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
            <Label tagName="div">
              <FormattedMessage id="ui-users.extended.folioNumber" />
            </Label>
            <div>{userId || '-'}</div>
          </Col>
        </Row>
        <Row>
          <Col
            xs={12}
            md={6}
          >
            <Row>
              <RequestPreferencesEdit addressTypes={addressTypes} />
            </Row>
          </Col>
          <Col
            xs={12}
            md={3}
          >
            <DepartmentsNameEdit departments={departments} />
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
          <IfPermission perm="ui-users.reset.password">
            {isEditForm && username &&
              (
                <CreateResetPasswordControl
                  userId={userId}
                  email={userEmail}
                  name={userFirstName}
                  username={username}
                />
              )
            }
          </IfPermission>
        </Row>
        <br />
      </Accordion>
    );
  }
}

export default EditExtendedInfo;

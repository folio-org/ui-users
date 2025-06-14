import { isEmpty } from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field } from 'react-final-form';
import {
  TextField,
  Row,
  Col,
  Accordion,
  Label,
  Datepicker,
  Headline,
} from '@folio/stripes/components';
import {
  IfPermission,
  stripesShape,
} from '@folio/stripes/core';

import { withFormValues } from '../../Wrappers';
import asyncValidateField from '../../validators/asyncValidateField';
import validateMinDate from '../../validators/validateMinDate';
import {
  addressTypesShape,
  departmentsShape,
} from '../../../shapes';
import {
  isConsortiumEnabled,
  isStaffUser,
} from '../../util';

import CreateResetPasswordControl from './CreateResetPasswordControl';
import RequestPreferencesEdit from './RequestPreferencesEdit';
import DepartmentsNameEdit from './DepartmentsNameEdit';

class EditExtendedInfo extends Component {
  static propTypes = {
    addressTypes: addressTypesShape,
    expanded: PropTypes.bool,
    departments: departmentsShape,
    userId: PropTypes.string,
    userEmail: PropTypes.string,
    accordionId: PropTypes.string.isRequired,
    userFirstName: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    onToggle: PropTypes.func,
    change: PropTypes.func.isRequired,
    values: PropTypes.object,
    uniquenessValidator: PropTypes.object,
    disabled: PropTypes.bool,
    stripes: stripesShape,
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

  getAddresses = () => {
    const { values } = this.props;
    const addresses = values?.personal?.addresses ?? [];

    return addresses.filter(address => !isEmpty(address)) ?? [];
  }

  getDefaultDeliveryAddressTypeId = () => {
    const { values } = this.props;
    return values?.requestPreferences?.defaultDeliveryAddressTypeId;
  }

  isDeliveryAvailable = () => {
    const { values } = this.props;
    return values?.requestPreferences?.delivery;
  }

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
      change,
      uniquenessValidator,
      disabled,
      values,
      stripes,
    } = this.props;

    const accordionHeader = this.buildAccordionHeader();
    const isEditForm = !!userId;
    const addresses = this.getAddresses();
    const defaultDeliveryAddressTypeId = this.getDefaultDeliveryAddressTypeId();
    const deliveryAvailable = this.isDeliveryAvailable();
    const isUsernameFieldRequired = isConsortiumEnabled(stripes) && isStaffUser(values);

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
              name="enrollmentDate"
              id="adduser_enrollmentdate"
              validate={validateMinDate('ui-users.errors.extended.dateEnrolled')}
              disabled={disabled}
              timeZone="UTC"
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
              disabled={disabled}
            />
          </Col>
          <Col
            xs={12}
            md={3}
          >
            <Field
              component={Datepicker}
              label={<FormattedMessage id="ui-users.extended.birthDate" />}
              name="personal.dateOfBirth"
              id="adduser_dateofbirth"
              timeZone="UTC"
              disabled={disabled}
              validate={validateMinDate('ui-users.errors.personal.dateOfBirth')}
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
        <RequestPreferencesEdit
          addressTypes={addressTypes}
          addresses={addresses}
          defaultDeliveryAddressTypeId={defaultDeliveryAddressTypeId}
          deliveryAvailable={deliveryAvailable}
          setFieldValue={change}
          disabled={disabled}
        />
        <Row>
          {departments.length
            ? (
              <Col
                xs={12}
                md={3}
              >
                <DepartmentsNameEdit departments={departments} disabled={disabled} />
              </Col>
            )
            : null
          }
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
              disabled={disabled}
              required={isUsernameFieldRequired}
              validate={asyncValidateField('username', username, uniquenessValidator)}
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
                  disabled={disabled}
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

export default withFormValues(EditExtendedInfo);

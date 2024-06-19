import React, { useEffect, useState } from 'react';
import {
  FormattedMessage,
  injectIntl,
} from 'react-intl';
import PropTypes from 'prop-types';
import { Field } from 'react-final-form';
import {
  Select,
  TextField,
  Row,
  Col,
  Accordion,
  Headline,
  MultiSelection,
} from '@folio/stripes/components';
import { AddressEditList } from '@folio/stripes/smart-components';

import { toAddressTypeOptions } from '../../data/converters/address_type';
import contactTypes from '../../data/static/contactTypes';
import { preferredEmailCommunicationOptions } from './constants';

const EditContactInfo = ({
  expanded,
  onToggle,
  accordionId,
  addressTypes,
  preferredContactTypeId,
  preferredEmailCommunication,
  intl,
  disabled,
}) => {
  const [preferredEmailCommData, setPreferredEmailCommData] = useState([]);

  useEffect(() => {
    const prefEmailCommLabeledData = preferredEmailCommunicationOptions.filter(
      option => preferredEmailCommunication.includes(option.value)
    );
    setPreferredEmailCommData(prefEmailCommLabeledData);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const contactTypeOptions = (contactTypes || []).map(g => {
    return (
      <FormattedMessage key={g.id} id={g.desc}>
        {(message) => <option value={g.id}>{message}</option>}
      </FormattedMessage>
    );
  });

  const selectedContactTypeId = contactTypeOptions.find(c => preferredContactTypeId === c.id)?.id;

  const addressFields = {
    addressType: {
      component: Select,
      props: {
        dataOptions: toAddressTypeOptions(addressTypes),
        fullWidth: true,
        autoFocus: true,
        placeholder: intl.formatMessage({ id: 'ui-users.contact.selectAddressType' }),
      },
    },
  };

  return (
    <Accordion
      open={expanded}
      id={accordionId}
      onToggle={onToggle}
      label={<Headline size="large" tag="h3"><FormattedMessage id="ui-users.contact.contactInfo" /></Headline>}
    >
      <Row>
        <Col xs={12} md={3}>
          <Field
            label={<FormattedMessage id="ui-users.contact.email" />}
            name="personal.email"
            id="adduser_email"
            component={TextField}
            required
            fullWidth
            disabled={disabled}
          />
        </Col>
        <Col xs={12} md={3}>
          <Field
            label={<FormattedMessage id="ui-users.contact.phone" />}
            name="personal.phone"
            id="adduser_phone"
            component={TextField}
            fullWidth
            disabled={disabled}
          />
        </Col>
        <Col xs={12} md={3}>
          <Field
            label={<FormattedMessage id="ui-users.contact.mobilePhone" />}
            name="personal.mobilePhone"
            id="adduser_mobilePhone"
            component={TextField}
            fullWidth
            disabled={disabled}
          />
        </Col>
        <Col xs={12} md={3}>
          <Field
            label={<FormattedMessage id="ui-users.contact.preferredContact" />}
            name="personal.preferredContactTypeId"
            id="adduser_preferredcontact"
            component={Select}
            fullWidth
            aria-required="true"
            required
            disabled={disabled}
            defaultValue={selectedContactTypeId}
          >
            <FormattedMessage id="ui-users.contact.selectContactType">
              {(message) => <option value="">{message}</option>}
            </FormattedMessage>
            {contactTypeOptions}
          </Field>
        </Col>
      </Row>
      <Row>
        <Col xs={12} md={3}>
          <Field
            component={MultiSelection}
            label={<FormattedMessage id="ui-users.contact.preferredEmailCommunication" />}
            id="adduserPreferredEmailCommunication"
            name="preferredEmailCommunication"
            dataOptions={preferredEmailCommunicationOptions}
            fullWidth
            aria-required="true"
            disabled={disabled}
            initialValue={preferredEmailCommData}
          />
        </Col>
      </Row>
      <br />
      <AddressEditList
        name="personal.addresses"
        fieldComponents={addressFields}
        canDelete
        formType="final-form"
        disabled={disabled}
      />
    </Accordion>
  );
};

EditContactInfo.propTypes = {
  expanded: PropTypes.bool,
  onToggle: PropTypes.func,
  accordionId: PropTypes.string.isRequired,
  addressTypes: PropTypes.arrayOf(PropTypes.object),
  preferredContactTypeId: PropTypes.string,
  preferredEmailCommunication: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.object])
  ),
  intl: PropTypes.object.isRequired,
  disabled: PropTypes.bool,
};

export default injectIntl(EditContactInfo);

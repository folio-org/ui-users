import React from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import {
  Select,
  TextField,
  Row,
  Col,
  Accordion,
  Headline
} from '@folio/stripes/components';
import { AddressEditList } from '@folio/stripes/smart-components';

import { toAddressTypeOptions } from '../../../converters/address_type';
import contactTypes from '../../../data/contactTypes';

const EditContactInfo = ({
  expanded,
  onToggle,
  accordionId,
  parentResources,
  initialValues,
}) => {
  const addressTypes = (parentResources.addressTypes || {}).records || [];
  const contactTypeOptions = (contactTypes || []).map(g => {
    const selected = initialValues.preferredContactTypeId === g.id;
    return {
      label: <FormattedMessage id={g.desc} />,
      value: g.id,
      selected,
    };
  });
  const addressFields = {
    addressType: {
      component: Select,
      props: {
        dataOptions: toAddressTypeOptions(addressTypes),
        fullWidth: true,
        placeholder: <FormattedMessage id="ui-users.contact.selectAddressType" />,
      },
    },
  };

  return (
    <Accordion
      open={expanded}
      id={accordionId}
      onToggle={onToggle}
      label={<Headline size="large" tag="h3"><FormattedMessage id="ui-users.contact.contactInformation" /></Headline>}
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
          />
        </Col>
        <Col xs={12} md={3}>
          <Field
            label={<FormattedMessage id="ui-users.contact.phone" />}
            name="personal.phone"
            id="adduser_phone"
            component={TextField}
            fullWidth
          />
        </Col>
        <Col xs={12} md={3}>
          <Field
            label={<FormattedMessage id="ui-users.contact.mobilePhone" />}
            name="personal.mobilePhone"
            id="adduser_mobilePhone"
            component={TextField}
            fullWidth
          />
        </Col>
        <Col xs={12} md={3}>
          <Field
            label={`${<FormattedMessage id="ui-users.contact.preferredContact" />} *`}
            name="personal.preferredContactTypeId"
            id="adduser_preferredcontact"
            component={Select}
            dataOptions={[{ label: <FormattedMessage id="ui-users.contact.selectContactType" />, value: '' }, ...contactTypeOptions]}
            fullWidth
          />
        </Col>
      </Row>
      <br />
      <AddressEditList name="personal.addresses" fieldComponents={addressFields} canDelete />
    </Accordion>
  );
};

EditContactInfo.propTypes = {
  expanded: PropTypes.bool,
  onToggle: PropTypes.func,
  accordionId: PropTypes.string.isRequired,
  parentResources: PropTypes.object,
  initialValues: PropTypes.object,
};

export default EditContactInfo;

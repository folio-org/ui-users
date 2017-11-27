import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';

import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import Select from '@folio/stripes-components/lib/Select';
import { Accordion } from '@folio/stripes-components/lib/Accordion';
import TextField from '@folio/stripes-components/lib/TextField';
import AddressEditList from '@folio/stripes-components/lib/structures/AddressFieldGroup/AddressEdit/AddressEditList';

import { toAddressTypeOptions } from '../../../converters/address_type';
import { countriesOptions } from '../../../data/countries';
import contactTypes from '../../../data/contactTypes';
import Autocomplete from '../../../lib/Autocomplete';

const ContactInfoSection = ({ expanded, onToggle, accordionId, parentResources, initialValues }) => {
  const addressTypes = (parentResources.addressTypes || {}).records || [];
  const contactTypeOptions = (contactTypes || []).map(g => ({
    label: g.desc, value: g.id, selected: initialValues.preferredContactTypeId === g.id }));
  const addressFields = {
    country: { component: Autocomplete, props: { dataOptions: countriesOptions } },
    addressType: { component: Select, props: { dataOptions: toAddressTypeOptions(addressTypes), fullWidth: true, placeholder: 'Select address type' } },
  };

  return (
    <Accordion
      open={expanded}
      id={accordionId}
      onToggle={onToggle}
      label={
        <h2>Contact information</h2>
      }
    >
      <Row>
        <Col xs={8}>
          <Row>
            <Col xs={3}>
              <Field label="Email" name="personal.email" id="adduser_email" component={TextField} required fullWidth />
            </Col>
            <Col xs={3}>
              <Field label="Phone" name="personal.phone" id="adduser_phone" component={TextField} fullWidth />
            </Col>
            <Col xs={3}>
              <Field label="Mobile phone" name="personal.mobilePhone" id="adduser_mobilePhone" component={TextField} fullWidth />
            </Col>
            <Col xs={3}>
              <Field label="Preferred contact *" name="personal.preferredContactTypeId" id="adduser_preferredcontact" component={Select} dataOptions={[{ label: 'Select contact type', value: '' }, ...contactTypeOptions]} fullWidth />
            </Col>
          </Row>
          <br />
          <Row>
            <Col xs={12}>
              <AddressEditList name="personal.addresses" fieldComponents={addressFields} canDelete />
            </Col>
          </Row>
        </Col>
      </Row>
    </Accordion>
  );
};

ContactInfoSection.propTypes = {
  expanded: PropTypes.bool,
  onToggle: PropTypes.func,
  accordionId: PropTypes.string.isRequired,
  parentResources: PropTypes.object,
  initialValues: PropTypes.object,
};

export default ContactInfoSection;

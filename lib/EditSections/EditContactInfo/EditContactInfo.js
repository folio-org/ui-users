import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';

import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import Select from '@folio/stripes-components/lib/Select';
import { Accordion } from '@folio/stripes-components/lib/Accordion';
import TextField from '@folio/stripes-components/lib/TextField';
import AddressEditList from '@folio/stripes-components/lib/AddressFieldGroup/AddressEdit/AddressEditList';

import { toAddressTypeOptions } from '../../../converters/address_type';
import contactTypes from '../../../data/contactTypes';

const EditContactInfo = ({ expanded, onToggle, accordionId, parentResources, initialValues, stripes: { intl } }) => {
  const addressTypes = (parentResources.addressTypes || {}).records || [];
  const contactTypeOptions = (contactTypes || []).map(g => ({ label: intl.formatMessage({ id: g.desc }), value: g.id, selected: initialValues.preferredContactTypeId === g.id }));
  const addressFields = {
    addressType: {
      component: Select,
      props: {
        dataOptions: toAddressTypeOptions(addressTypes),
        fullWidth: true,
        placeholder: intl.formatMessage({ id: 'ui-users.contact.selectAddressType' }),
      },
    },
  };

  return (
    <Accordion
      open={expanded}
      id={accordionId}
      onToggle={onToggle}
      label={intl.formatMessage({ id: 'ui-users.contact.contactInformation' })}
    >
      <Row>
        <Col xs={8}>
          <Row>
            <Col xs={3}>
              <Field label={intl.formatMessage({ id: 'ui-users.contact.email' })} name="personal.email" id="adduser_email" component={TextField} required fullWidth />
            </Col>
            <Col xs={3}>
              <Field label={intl.formatMessage({ id: 'ui-users.contact.phone' })} name="personal.phone" id="adduser_phone" component={TextField} fullWidth />
            </Col>
            <Col xs={3}>
              <Field label={intl.formatMessage({ id: 'ui-users.contact.mobilePhone' })} name="personal.mobilePhone" id="adduser_mobilePhone" component={TextField} fullWidth />
            </Col>
            <Col xs={3}>
              <Field
                label={`${intl.formatMessage({ id: 'ui-users.contact.preferredContact' })} *`}
                name="personal.preferredContactTypeId"
                id="adduser_preferredcontact"
                component={Select}
                dataOptions={[{ label: intl.formatMessage({ id: 'ui-users.contact.selectContactType' }), value: '' }, ...contactTypeOptions]}
                fullWidth
              />
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

EditContactInfo.propTypes = {
  stripes: PropTypes.shape({
    intl: PropTypes.object.isRequired,
  }).isRequired,
  expanded: PropTypes.bool,
  onToggle: PropTypes.func,
  accordionId: PropTypes.string.isRequired,
  parentResources: PropTypes.object,
  initialValues: PropTypes.object,
};

export default EditContactInfo;

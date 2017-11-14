import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import Select from '@folio/stripes-components/lib/Select';
import RadioButtonGroup from '@folio/stripes-components/lib/RadioButtonGroup';
import RadioButton from '@folio/stripes-components/lib/RadioButton';
import Datepicker from '@folio/stripes-components/lib/Datepicker';
import { Accordion } from '@folio/stripes-components/lib/Accordion';
import TextField from '@folio/stripes-components/lib/TextField';

const UserInfoSection = ({ expanded, onToggle, accordionId, parentResources, initialValues }) => {
  const patronGroups = (parentResources.patronGroups || {}).records || [];
  const patronGroupOptions = (patronGroups || []).map(g => ({
    label: `${g.group} (${g.desc})`, value: g.id, selected: initialValues.patronGroup === g.id }));

  return (
    <Accordion
      open={expanded}
      id={accordionId}
      onToggle={onToggle}
      label={
        <h2>User Information</h2>
      }
    >
      <Row>
        <Col xs={3}>
          <Field label="Last Name *" name="personal.lastName" id="adduser_lastname" component={TextField} required fullWidth />
        </Col>
        <Col xs={3}>
          <Field label="First Name" name="personal.firstName" id="adduser_firstname" component={TextField} fullWidth />
        </Col>
        <Col xs={3}>
          <Field label="Middle Name" name="personal.middleName" id="adduser_middlename" component={TextField} fullWidth />
        </Col>
        <Col xs={3}>
          <Field label="Barcode" name="barcode" id="adduser_barcode" component={TextField} fullWidth />
        </Col>
      </Row>

      <Row>
        <Col xs={3}>
          <Field
            label="Patron Group *"
            name="patronGroup"
            id="adduser_group"
            component={Select}
            fullWidth
            dataOptions={[{ label: 'Select patron group', value: '' }, ...patronGroupOptions]}
          />
        </Col>
        <Col xs={3}>
          <Field label="Status *" name="active" component={RadioButtonGroup}>
            <RadioButton label="Active" id="useractiveYesRB" value="true" inline />
            <RadioButton label="Inactive" id="useractiveNoRB" value="false" inline />
          </Field>
        </Col>
        <Col xs={3}>
          <Field
            component={Datepicker}
            label="Expiration Date"
            dateFormat="YYYY-MM-DD"
            name="expirationDate"
            id="adduser_expirationdate"
          />
        </Col>
        <Col xs={3}>
          <Field label="Username *" name="username" id="adduser_username" component={TextField} required fullWidth />
        </Col>
      </Row>
    </Accordion>
  );
};

UserInfoSection.propTypes = {
  expanded: PropTypes.bool,
  onToggle: PropTypes.func,
  accordionId: PropTypes.string.isRequired,
  parentResources: PropTypes.object,
  initialValues: PropTypes.object,
};

export default UserInfoSection;

import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import Select from '@folio/stripes-components/lib/Select';
import Datepicker from '@folio/stripes-components/lib/Datepicker';
import TextField from '@folio/stripes-components/lib/TextField';

import css from './EditUserInfo.css';

const EditUserInfo = ({ parentResources, initialValues }) => {
  const patronGroups = (parentResources.patronGroups || {}).records || [];
  const patronGroupOptions = (patronGroups || []).map(g => ({
    label: `${g.group} (${g.desc})`, value: g.id, selected: initialValues.patronGroup === g.id }));
  const statusOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false },
  ].map(s => ({ ...s, selected: (initialValues.active === s.value || s.value === true) }));

  return (
    <div>
      <section className={css.root}>
        <div className={css.label}>
          <h2>User information</h2>
        </div>
        <Row>
          <Col xs={8}>
            <Row>
              <Col xs={3}>
                <Field label="Last name *" name="personal.lastName" id="adduser_lastname" component={TextField} required fullWidth />
              </Col>
              <Col xs={3}>
                <Field label="First name" name="personal.firstName" id="adduser_firstname" component={TextField} fullWidth />
              </Col>
              <Col xs={3}>
                <Field label="Middle name" name="personal.middleName" id="adduser_middlename" component={TextField} fullWidth />
              </Col>
              <Col xs={3}>
                <Field label="Barcode" name="barcode" id="adduser_barcode" component={TextField} fullWidth />
              </Col>
            </Row>

            <Row>
              <Col xs={3}>
                <Field
                  label="Patron group *"
                  name="patronGroup"
                  id="adduser_group"
                  component={Select}
                  fullWidth
                  dataOptions={[{ label: 'Select patron group', value: '' }, ...patronGroupOptions]}
                />
              </Col>
              <Col xs={3}>
                <Field
                  label="Status *"
                  name="active"
                  id="useractive"
                  component={Select}
                  fullWidth
                  dataOptions={statusOptions}
                />
              </Col>
              <Col xs={3}>
                <Field
                  component={Datepicker}
                  label="Expiration date"
                  dateFormat="YYYY-MM-DD"
                  name="expirationDate"
                  id="adduser_expirationdate"
                />
              </Col>
              <Col xs={3}>
                <Field label="Username *" name="username" id="adduser_username" component={TextField} required fullWidth />
              </Col>
            </Row>
          </Col>
        </Row>
      </section>
      <br />
      <div className={css.separator} />
    </div>
  );
};

EditUserInfo.propTypes = {
  parentResources: PropTypes.object,
  initialValues: PropTypes.object,
};

export default EditUserInfo;

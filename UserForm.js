import React, { Component, PropTypes } from 'react'; // eslint-disable-line
import Paneset from '@folio/stripes-components/lib/Paneset'; // eslint-disable-line
import Pane from '@folio/stripes-components/lib/Pane'; // eslint-disable-line
import PaneMenu from '@folio/stripes-components/lib/PaneMenu'; // eslint-disable-line
import {Row, Col} from 'react-bootstrap'; // eslint-disable-line
import Button from '@folio/stripes-components/lib/Button'; // eslint-disable-line
import TextField from '@folio/stripes-components/lib/TextField'; // eslint-disable-line
import Select from '@folio/stripes-components/lib/Select'; // eslint-disable-line
import RadioButtonGroup from '@folio/stripes-components/lib/RadioButtonGroup'; // eslint-disable-line
import RadioButton from '@folio/stripes-components/lib/RadioButton'; // eslint-disable-line

import {Field, reducer as formReducer, reduxForm} from 'redux-form'; // eslint-disable-line

const propTypes = {
  onClose: PropTypes.func, // eslint-disable-line react/no-unused-prop-types
  newUser: PropTypes.bool, // eslint-disable-line react/no-unused-prop-types
  handleSubmit: PropTypes.func.isRequired,
  reset: PropTypes.func,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  onCancel: PropTypes.func,
  initialValues: PropTypes.object,
};

function UserForm(props) {
  const {
    handleSubmit,
    reset,  // eslint-disable-line no-unused-vars
    pristine,
    submitting,
    onCancel,
    initialValues,
  } = props;

  /* Menues for Add User workflow */
  const addUserFirstMenu = <PaneMenu><button onClick={onCancel} title="close" aria-label="Close New User Dialog"><span style={{ fontSize: '30px', color: '#999', lineHeight: '18px' }} >&times;</span></button></PaneMenu>;
  const addUserLastMenu = <PaneMenu><Button type="submit" title="Create New User" disabled={pristine || submitting} onClick={handleSubmit}>Create User</Button></PaneMenu>;
  const editUserLastMenu = <PaneMenu><Button type="submit" title="Update User" disabled={pristine || submitting} onClick={handleSubmit}>Update User</Button></PaneMenu>;

  return (
    <form>
      <Paneset>
        <Pane defaultWidth="100%" firstMenu={addUserFirstMenu} lastMenu={initialValues ? editUserLastMenu : addUserLastMenu} paneTitle={initialValues ? 'Edit User' : 'New User'}>
          <Row>
            <Col sm={5} smOffset={1}>
              <h2>User Record</h2>
              <Field label="UserName" name="username" id="adduser_username" component={TextField} required fullWidth />
              <Field label="Active" name="active" component={RadioButtonGroup}>
                <RadioButton label="Yes" id="useractiveYesRB" value="true" inline />
                <RadioButton label="No" id="useractiveNoRB" value="false" inline />
              </Field>
              <Field label="password" name="creds.password" id="pw" component={TextField} fullWidth />
              <fieldset>
                <legend>Personal Info</legend>
                <Field label="First Name" name="personal.first_name" id="adduser_firstname" component={TextField} required fullWidth />
                <Field label="Last Name" name="personal.last_name" id="adduser_lastname" component={TextField} fullWidth />
                <Field label="Email" name="personal.email" id="adduser_email" component={TextField} required fullWidth />
              </fieldset>
              <Field
                label="Type"
                name="type"
                id="adduser_type"
                component={Select}
                fullWidth
                dataOptions={[{ label: 'Select user type', value: '' }, { label: 'Patron', value: 'Patron', selected: 'selected' }]}
              />
              <Field
                label="Group"
                name="patron_group"
                id="adduser_group"
                component={Select}
                fullWidth
                dataOptions={[{ label: 'Select patron group', value: '' }, { label: 'On-campus', value: 'on_campus', selected: 'selected' }]}
              />

            </Col>
          </Row>
        </Pane>

      </Paneset>
    </form>
  );
}

UserForm.propTypes = propTypes;

export default reduxForm({
  form: 'userForm',
})(UserForm);

// We have to remove node_modules/react to avoid having multiple copies loaded.
// eslint-disable-next-line import/no-unresolved
import React, { PropTypes } from 'react';
import Paneset from '@folio/stripes-components/lib/Paneset';
import Pane from '@folio/stripes-components/lib/Pane';
import PaneMenu from '@folio/stripes-components/lib/PaneMenu';
import { Row, Col } from 'react-bootstrap';
import Button from '@folio/stripes-components/lib/Button';
import TextField from '@folio/stripes-components/lib/TextField';
import Select from '@folio/stripes-components/lib/Select';
import RadioButtonGroup from '@folio/stripes-components/lib/RadioButtonGroup';
import RadioButton from '@folio/stripes-components/lib/RadioButton';
import fetch from 'isomorphic-fetch';


import { Field, reduxForm } from 'redux-form';

const sys = require('stripes-loader'); // eslint-disable-line
const okapiUrl = sys.okapi.url;
const tenant = sys.okapi.tenant;
let okapiToken = '';

function validate(values) {
  const errors = {};

  if (!values.personal || !values.personal.last_name) {
    errors.personal = { last_name: 'Please fill this in to continue' };
  }

  if (!values.username) {
    errors.username = 'Please fill this in to continue';
  }
  return errors;
}

function checkUniqueUserID(username) {
  return fetch(`${okapiUrl}/users?query=(username="${username}")`,
    { headers: Object.assign({}, {
      'X-Okapi-Tenant': tenant,
      'X-Okapi-Token': okapiToken,
      'Content-Type': 'application/json' }),
    },
  );
}

function asyncValidate(values, dispatch, props, blurredField) {
  if (blurredField === 'username' && values.username !== props.initialValues.username) {
    return new Promise((resolve, reject) => {
      // TODO: Should use stripes-connect (dispatching an action and update state)
      checkUniqueUserID(values.username).then((response) => {
        if (response.status >= 400) {
          console.log('Error fetching user');
        } else {
          response.json().then((json) => {
            if (json.total_records > 0)
              reject({ username: 'This User ID has already been taken' });
            else
              resolve();
          });
        }
      });
    });
  }
  return new Promise(resolve => resolve());
}

class UserForm extends React.Component {

  static contextTypes = {
    store: PropTypes.object,
  };

  static propTypes = {
    onClose: PropTypes.func, // eslint-disable-line react/no-unused-prop-types
    newUser: PropTypes.bool, // eslint-disable-line react/no-unused-prop-types
    handleSubmit: PropTypes.func.isRequired,
    reset: PropTypes.func,
    pristine: PropTypes.bool,
    submitting: PropTypes.bool,
    onCancel: PropTypes.func,
    initialValues: PropTypes.object,
  };

  constructor(props, context) {
    super(props);
    okapiToken = context.store.getState().okapi.token;
  }

  render() {
    const {
      handleSubmit,
      reset,  // eslint-disable-line no-unused-vars
      pristine,
      submitting,
      onCancel,
      initialValues,
    } = this.props;

    /* Menues for Add User workflow */
    const addUserFirstMenu = <PaneMenu><button onClick={onCancel} title="close" aria-label="Close New User Dialog"><span style={{ fontSize: '30px', color: '#999', lineHeight: '18px' }} >&times;</span></button></PaneMenu>;
    const addUserLastMenu = <PaneMenu><Button type="submit" title="Create New User" disabled={pristine || submitting} onClick={handleSubmit}>Create User</Button></PaneMenu>;
    const editUserLastMenu = <PaneMenu><Button type="submit" title="Update User" disabled={pristine || submitting} onClick={handleSubmit}>Update User</Button></PaneMenu>;
    const patronGroupOptions = (initialValues.available_patron_groups || []).map(g => ({
      label: g.group, value: g.id, selected: initialValues.patron_group === g.id }));

    return (
      <form>
        <Paneset>
          <Pane defaultWidth="100%" firstMenu={addUserFirstMenu} lastMenu={initialValues.username ? editUserLastMenu : addUserLastMenu} paneTitle={initialValues.username ? 'Edit User' : 'New User'}>
            <Row>
              <Col sm={5} smOffset={1}>
                <h2>User Record</h2>
                <Field label="User ID" name="username" id="adduser_username" component={TextField} required fullWidth />
                {!initialValues.id ? <Field label="Password" name="creds.password" id="pw" component={TextField} required fullWidth /> : null}
                <Field label="Status" name="active" component={RadioButtonGroup}>
                  <RadioButton label="Active" id="useractiveYesRB" value="true" inline />
                  <RadioButton label="Inactive" id="useractiveNoRB" value="false" inline />
                </Field>
                <fieldset>
                  <legend>Personal Info</legend>
                  <Field label="First Name" name="personal.first_name" id="adduser_firstname" component={TextField} required fullWidth />
                  <Field label="Last Name" name="personal.last_name" id="adduser_lastname" component={TextField} fullWidth />
                  <Field label="Email" name="personal.email" id="adduser_email" component={TextField} required fullWidth />
                </fieldset>
                {/* <Field
                  label="Type"
                  name="type"
                  id="adduser_type"
                  component={Select}
                  fullWidth
                  dataOptions={[{ label: 'Select user type', value: '' },
                                { label: 'Patron', value: 'Patron', selected: 'selected' }]}
                /> */}
                <Field
                  label="Patron Group"
                  name="patron_group"
                  id="adduser_group"
                  component={Select}
                  fullWidth
                  dataOptions={[{ label: 'Select patron group', value: null }, ...patronGroupOptions]}
                />
              </Col>
            </Row>
          </Pane>

        </Paneset>
      </form>
    );
  }
}

export default reduxForm({
  form: 'userForm',
  validate,
  asyncValidate,
  asyncBlurFields: ['username'],
})(UserForm);

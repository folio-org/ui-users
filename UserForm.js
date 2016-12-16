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


class UserForm extends Component {

  static propTypes = {
    onClose: PropTypes.func, // eslint-disable-line react/no-unused-prop-types
    newUser: PropTypes.bool, // eslint-disable-line react/no-unused-prop-types
    handleSubmit: PropTypes.func.isRequired,
    reset: PropTypes.func,
    pristine: PropTypes.bool,
    submitting: PropTypes.bool,
    onCancel: PropTypes.func,
  }

  constructor(props) {
    super(props);
    // Silences:
    // "Component should be written as a pure function  react/prefer-stateless-function"
    // (?)
    this.dummy = {};
  }

  render() {
    const {
      handleSubmit,
      reset,  // eslint-disable-line no-unused-vars
      pristine,
      submitting,
      onCancel,
    } = this.props;

    /* Menues for Add User workflow */
    const addUserFirstMenu = <PaneMenu><button onClick={onCancel} title="close" aria-label="Close New User Dialog"><span style={{ fontSize: '30px', color: '#999', lineHeight: '18px' }} >&times;</span></button></PaneMenu>;
    const addUserLastMenu = <PaneMenu><Button type="submit" title="Create New User" disabled={pristine || submitting} onClick={handleSubmit}>Create User</Button></PaneMenu>;

    return (
      <form>
        <Paneset>
          <Pane defaultWidth="100%" firstMenu={addUserFirstMenu} lastMenu={addUserLastMenu} paneTitle="New User">
            <Row>
              <Col sm={5} smOffset={1}>
                <h2>User Record</h2>
                <Field label="UserName" name="username" id="adduser_username" component={TextField} required fullWidth />
                <Field label="Active" name="active" component={RadioButtonGroup}>
                  <RadioButton label="Yes" id="useractiveYesRB" value="true" inline />
                  <RadioButton label="No" id="useractiveNoRB" value="false" inline />
                </Field>
                <fieldset>
                  <legend>Personal Info</legend>
                  <Field label="Full Name" name="personal.full_name" id="adduser_fullname" component={TextField} required fullWidth />
                  <Field label="Primary Email" name="personal.email_primary" id="adduser_primaryemail" component={TextField} required fullWidth />
                  <Field label="Secondary Email" name="personal.email_secondary" id="adduser_secondemail" component={TextField} fullWidth />
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
}

export default reduxForm({
  form: 'userForm',
})(UserForm);

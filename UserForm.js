import React, { Component, PropTypes } from 'react';
import Paneset from '@folio/stripes-components/lib/Paneset'
import Pane from '@folio/stripes-components/lib/Pane'
import PaneMenu from '@folio/stripes-components/lib/PaneMenu'
import {Row, Col} from 'react-bootstrap'
import Button from '@folio/stripes-components/lib/Button'
import TextField from '@folio/stripes-components/lib/TextField'
import Select from '@folio/stripes-components/lib/Select'
import RadioButtonGroup from '@folio/stripes-components/lib/RadioButtonGroup'
import RadioButton from '@folio/stripes-components/lib/RadioButton'

import {Field, reducer as formReducer, reduxForm} from 'redux-form'

const propTypes={
  onClose: PropTypes.func,
  newUser: PropTypes.bool,
  handleSubmit: PropTypes.func.isRequired
}

class UserForm extends Component {
  render() {
    const {    
      handleSubmit,
      reset,
      pristine,
      submitting,
      onCancel
    } = this.props;
    /*Menues for Add User workflow*/
    const addUserFirstMenu = <PaneMenu><button onClick={onCancel} title="close" aria-label="Close New User Dialog"><span style={{fontSize:'30px', color: '#999', lineHeight:"18px"}}>&times;</span></button></PaneMenu>
    const addUserLastMenu = <PaneMenu><Button type="submit" title="Create New User" disabled={pristine || submitting} onClick={handleSubmit}>Create User</Button></PaneMenu>
    
    return (
      <form>
        <Paneset>
          <Pane defaultWidth="100%" firstMenu={addUserFirstMenu} lastMenu={addUserLastMenu} paneTitle="New User">
            <Row>
              <Col sm={5} smOffset={1}>
                <h2>User Record</h2>
                <Field label="UserName" name="username" id="adduser_username" component={TextField} required fullWidth/>
                <Field label="Active" name="active" component={RadioButtonGroup}>
                  <RadioButton label ="Yes" id="useractiveYesRB" value="true" inline />
                  <RadioButton label ="No" id="useractiveNoRB" value="false" inline />
                </Field>
                <fieldset>
                  <legend>Personal Info</legend>
                  <Field label="Full Name" name="personal.full_name" id="adduser_fullname" component={TextField} required fullWidth/>
                  <Field label="Primary Email" name="personal.email_primary" id="adduser_primaryemail" component={TextField} required fullWidth/>
                  <Field label="Secondary Email" name="personal.email_secondary" id="adduser_secondemail" component={TextField} fullWidth/>
                </fieldset>
                <Field label="Type" name="type" id="adduser_type" component={Select} fullWidth
                  dataOptions={[{label: 'Select user type', value:''},{label:'Patron', value:'Patron', selected:'selected'}]}
                />
                <Field label="Group" name="patron_group" id="adduser_group" component={Select} fullWidth
                        dataOptions={[{label: 'Select patron group', value:''},{label:'On-campus', value:'on_campus', selected:'selected' }]}
                />
              </Col>
            </Row>
          </Pane>

        </Paneset>
      </form>
    )
  }
}

UserForm.propTypes = propTypes;

export default reduxForm({
  form: 'userForm'
})(UserForm);

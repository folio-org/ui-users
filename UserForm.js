import React from 'react';
import PropTypes from 'prop-types';
import Paneset from '@folio/stripes-components/lib/Paneset';
import Pane from '@folio/stripes-components/lib/Pane';
import PaneMenu from '@folio/stripes-components/lib/PaneMenu';
import { Glyphicon } from 'react-bootstrap';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import Button from '@folio/stripes-components/lib/Button';
import TextField from '@folio/stripes-components/lib/TextField';
import Select from '@folio/stripes-components/lib/Select';
import RadioButtonGroup from '@folio/stripes-components/lib/RadioButtonGroup';
import RadioButton from '@folio/stripes-components/lib/RadioButton';
import Datepicker from '@folio/stripes-components/lib/Datepicker';
import AddressEditList from '@folio/stripes-components/lib/structures/AddressFieldGroup/AddressEdit/AddressEditList';
import { Field } from 'redux-form';
import stripesForm from '@folio/stripes-form';
import classNames from 'classnames';

import { countriesOptions } from './data/countries';
import Autocomplete from './lib/Autocomplete';
import { toAddressTypeOptions } from './converters/address_type';
import css from './UserForm.css';

function validate(values) {
  const errors = {};

  if (!values.personal || !values.personal.lastName) {
    errors.personal = { lastName: 'Please fill this in to continue' };
  }

  if (!values.username) {
    errors.username = 'Please fill this in to continue';
  }

  if (!values.patronGroup) {
    errors.patronGroup = 'Please select a patron group';
  }

  if (!values.personal || !values.personal.preferredContactTypeId) {
    errors.personal = { preferredContactTypeId: 'Please select a preferred form of contact' };
  }
  return errors;
}

function asyncValidate(values, dispatch, props, blurredField) {
  if (blurredField === 'username' && values.username !== props.initialValues.username) {
    return new Promise((resolve, reject) => {
      props.uniquenessValidator.reset();
      const query = `(username="${values.username}")`;
      props.uniquenessValidator.GET({ params: { query } }).then((users) => {
        if (users.length > 0) {
          reject({ username: 'This username has already been taken' });
        } else {
          resolve();
        }
      });
    });
  }

  return new Promise(resolve => resolve());
}

class UserForm extends React.Component {

  static propTypes = {
    onClose: PropTypes.func, // eslint-disable-line react/no-unused-prop-types
    newUser: PropTypes.bool, // eslint-disable-line react/no-unused-prop-types
    handleSubmit: PropTypes.func.isRequired,
    uniquenessValidator: PropTypes.object, // eslint-disable-line react/no-unused-prop-types
    reset: PropTypes.func,
    pristine: PropTypes.bool,
    submitting: PropTypes.bool,
    onCancel: PropTypes.func,
    initialValues: PropTypes.object,
    optionLists: PropTypes.shape({
      userGroups: PropTypes.arrayOf(PropTypes.object),
      contactTypes: PropTypes.arrayOf(PropTypes.object),
    }),
    addressTypes: PropTypes.arrayOf(PropTypes.object),
  };

  constructor(props) {
    super(props);
    this.state = { showPassword: false };
  }

  togglePassword() {
    this.setState({
      showPassword: !this.state.showPassword,
    });
  }

  render() {
    const {
      handleSubmit,
      reset,  // eslint-disable-line no-unused-vars
      pristine,
      submitting,
      onCancel,
      initialValues,
      optionLists,
      addressTypes,
    } = this.props;

    /* Menues for Add User workflow */
    const addUserFirstMenu = <PaneMenu><button id="clickable-closenewuserdialog" onClick={onCancel} title="close" aria-label="Close New User Dialog"><span style={{ fontSize: '30px', color: '#999', lineHeight: '18px' }} >&times;</span></button></PaneMenu>;
    const addUserLastMenu = <PaneMenu><Button id="clickable-createnewuser" type="submit" title="Create New User" disabled={pristine || submitting} onClick={handleSubmit}>Create User</Button></PaneMenu>;
    const editUserLastMenu = <PaneMenu><Button id="clickable-updateuser" type="submit" title="Update User" disabled={pristine || submitting} onClick={handleSubmit}>Update User</Button></PaneMenu>;
    const patronGroupOptions = (optionLists.patronGroups || []).map(g => ({
      label: `${g.group} (${g.desc})`, value: g.id, selected: initialValues.patronGroup === g.id }));
    const contactTypeOptions = (optionLists.contactTypes || []).map(g => ({
      label: g.desc, value: g.id, selected: initialValues.preferredContactTypeId === g.id }));

    const addressFields = {
      country: { component: Autocomplete, props: { dataOptions: countriesOptions } },
      addressType: { component: Select, props: { dataOptions: toAddressTypeOptions(addressTypes), fullWidth: true, placeholder: 'Select address type' } },
    };

    return (
      <form className={css.UserFormRoot} id="form-user">
        <Paneset isRoot>
          <Pane defaultWidth="100%" firstMenu={addUserFirstMenu} lastMenu={initialValues.username ? editUserLastMenu : addUserLastMenu} paneTitle={initialValues.username ? 'Edit User' : 'New User'}>
            <Row>
              <Col sm={5} smOffset={1}>
                <h2>User Record</h2>
                <Field label="Username *" name="username" id="adduser_username" component={TextField} required fullWidth />
                {!initialValues.id &&
                  <div className="input-group">
                    <Field label="Password" name="creds.password" id="pw" autoComplete="new-password" type={this.state.showPassword ? 'text' : 'password'} component={TextField} required fullWidth />
                    <span className={classNames('input-group-btn', css.togglePw)}>
                      <Button buttonStyle="secondary hollow" id="toggle_pw_btn" onClick={() => this.togglePassword()}>
                        {this.state.showPassword ? <Glyphicon glyph="eye-open" /> : <Glyphicon glyph="eye-close" />}
                      </Button>
                    </span>
                  </div>
                }
                <Field label="Status *" name="active" component={RadioButtonGroup}>
                  <RadioButton label="Active" id="useractiveYesRB" value="true" inline />
                  <RadioButton label="Inactive" id="useractiveNoRB" value="false" inline />
                </Field>
                <fieldset>
                  <legend>Personal Info</legend>
                  <Field label="First Name" name="personal.firstName" id="adduser_firstname" component={TextField} required fullWidth />
                  <Field label="Middle Name" name="personal.middleName" id="adduser_middlename" component={TextField} fullWidth />
                  <Field label="Last Name *" name="personal.lastName" id="adduser_lastname" component={TextField} fullWidth />
                  <Field label="Email" name="personal.email" id="adduser_email" component={TextField} required fullWidth />
                  <Field label="Phone" name="personal.phone" id="adduser_phone" component={TextField} fullWidth />
                  <Field label="Mobile Phone" name="personal.mobilePhone" id="adduser_mobilePhone" component={TextField} fullWidth />
                  <Field label="Preferred Contact *" name="personal.preferredContactTypeId" id="adduser_preferredcontact" component={Select} dataOptions={[{ label: 'Select contact type', value: '' }, ...contactTypeOptions]} fullWidth />
                </fieldset>
                <Field
                  component={Datepicker}
                  label="Date of Birth"
                  dateFormat="YYYY-MM-DD"
                  name="personal.dateOfBirth"
                  id="adduser_dateofbirth"
                  backendDateStandard="YYYY-MM-DD"
                />
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
                  label="Patron Group *"
                  name="patronGroup"
                  id="adduser_group"
                  component={Select}
                  fullWidth
                  dataOptions={[{ label: 'Select patron group', value: '' }, ...patronGroupOptions]}
                />
                <Field
                  component={Datepicker}
                  label="Date Enrolled"
                  dateFormat="YYYY-MM-DD"
                  name="enrollmentDate"
                  id="adduser_enrollmentdate"
                />
                <Field
                  component={Datepicker}
                  label="Expiration Date"
                  dateFormat="YYYY-MM-DD"
                  name="expirationDate"
                  id="adduser_expirationdate"
                />
                <Field label="Barcode" name="barcode" id="adduser_barcode" component={TextField} fullWidth />
                <Field label="FOLIO Record Number" name="id" id="adduser_id" readOnly component={TextField} fullWidth />
                <Field label="External System ID" name="externalSystemId" id="adduser_externalsystemid" component={TextField} fullWidth />

                <AddressEditList name="personal.addresses" fieldComponents={addressFields} canDelete />
              </Col>
            </Row>
          </Pane>
        </Paneset>
      </form>
    );
  }
}

export default stripesForm({
  form: 'userForm',
  validate,
  asyncValidate,
  asyncBlurFields: ['username'],
  navigationCheck: true,
})(UserForm);

import React, { Component, PropTypes } from 'react';
import { connect } from '@folio/stripes-connect'; // eslint-disable-line
import Pane from '@folio/stripes-components/lib/Pane';
import Textfield from '@folio/stripes-components/lib/TextField';
import TextArea from '@folio/stripes-components/lib/TextArea';

import {Field, reducer as formReducer, reduxForm} from 'redux-form';

import UserPermissions from '../UserPermissions';

class PermissionSetDetails extends Component {

  static propTypes = {
    stripes: PropTypes.shape({
      hasPerm: PropTypes.func.isRequired,
    }).isRequired,
    initialValues: PropTypes.object,
    data: PropTypes.shape({
      availablePermissions: PropTypes.arrayOf(PropTypes.object)
    })
  };

  static manifest = Object.freeze({
    availablePermissions: {
      type: 'okapi',
      records: 'permissions',
      // DELETE: {
      //   pk: 'permissionName',
      //   path: 'perms/users/:{username}/permissions',
      // },
      // GET: {
      //   path: 'perms/users/:{username}/permissions?full=true',
      // },
      GET: {
        path: 'perms/permissions?length=100&query=(mutable=false)'
      }
    }
  });

  constructor(props) {
    super(props);
  }

  render() {
    const { data: { availablePermissions }, selectedSet } = this.props;
    console.log(this);
    return (
      <Pane paneTitle={"Permission Set "+selectedSet.permissionName} defaultWidth="fill" >
        <form>
          <section>
            <h2 style={{ marginTop: '0' }}>About</h2>
            <Field label="Title" name="permissionName" id="permissionName" component={Textfield} required fullWidth rounded />
            <Field label="Description" name="description" id="permissionset_description" component={TextArea} required fullWidth rounded />
          </section>
          <UserPermissions sectionHeading="Contains" setPermissions={selectedSet.subPermissions} availablePermissions={availablePermissions} parentProps={this.props} stripes={this.props.stripes} />
        </form>
      </Pane>
    );
  }
}

export default reduxForm({
  form: 'permissionSetForm',
  enableReinitialize: true
})(connect(PermissionSetDetails, '@folio/users'));

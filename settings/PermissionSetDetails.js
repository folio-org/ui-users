import React, { Component, PropTypes } from 'react';
import { connect } from '@folio/stripes-connect'; // eslint-disable-line
import Pane from '@folio/stripes-components/lib/Pane';
import Textfield from '@folio/stripes-components/lib/TextField';
import TextArea from '@folio/stripes-components/lib/TextArea';

import {Field, reducer as formReducer, reduxForm} from 'redux-form'; // eslint-disable-line

import UserPermissions from '../UserPermissions';

class PermissionSetDetails extends Component {

  static propTypes = {
    initialValues: PropTypes.object,
    data: PropTypes.shape({
      availablePermissions: PropTypes.arrayOf(PropTypes.object)
    })
  };

  static manifest = Object.freeze({
    availablePermissions: {
      type: 'okapi',
      records: 'permissions',
      path: 'perms/permissions?length=100'
    }
  });

  constructor(props) {
    super(props);
  }

  render() {
    console.log(this.props);
    const { data: { availablePermissions }, selectedSet } = this.props;
    
    return (
      <Pane paneTitle={"Permission Set "+selectedSet.title} defaultWidth="fill" >
        <form>
          <section>
            <h2 style={{ marginTop: '0' }}>About</h2>
            <Field label="Title" name="title" id="permissionset_title" component={Textfield} required fullWidth rounded />
            <Field label="Description" name="description" id="permissionset_description" component={TextArea} required fullWidth rounded />
          </section>
          <UserPermissions sectionHeading="Contains" availablePermissions={availablePermissions} />
        </form>
      </Pane>
    );
  }
}

export default reduxForm({
  form: 'permissionSetForm',
  enableReinitialize: true
})(connect(PermissionSetDetails, '@folio/users'));

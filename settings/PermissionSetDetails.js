import React from 'react';

import Pane from '@folio/stripes-components/lib/Pane';
import Textfield from '@folio/stripes-components/lib/TextField';
import TextArea from '@folio/stripes-components/lib/TextArea';

import {Field, reducer as formReducer, reduxForm} from 'redux-form';

import UserPermissions from '../UserPermissions';

class PermissionSetDetails extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Pane paneTitle="Patron Groups" defaultWidth="fill" >
        <form>
          <section>
            <h2 style={{ marginTop: '0' }}>About</h2>
            <Field label="Title" name="title" id="permissionset_title" component={Textfield} required fullWidth />
            <Field label="Description" name="description" id="permissionset_description" component={TextArea} required fullWidth />
          </section>
          <UserPermissions availablePermissions={[]} />
        </form>
      </Pane>
    );
  }
}

export default reduxForm({
  form: 'permissionSetForm',
})(PermissionSetDetails);

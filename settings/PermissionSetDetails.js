import React, {PropTypes} from 'react';

import Pane from '@folio/stripes-components/lib/Pane';
import Textfield from '@folio/stripes-components/lib/TextField';
import TextArea from '@folio/stripes-components/lib/TextArea';

import {Field, reducer as formReducer, reduxForm} from 'redux-form'; // eslint-disable-line

import UserPermissions from '../UserPermissions';

const propTypes = {
  initialValues: PropTypes.object,
};

class PermissionSetDetails extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {

    const selectedSet = this.props.selectedSet;
    
    return (
      <Pane paneTitle={"Permission Set "+selectedSet.title} defaultWidth="fill" >
        <form>
          <section>
            <h2 style={{ marginTop: '0' }}>About</h2>
            <Field label="Title" name="title" id="permissionset_title" component={Textfield} required fullWidth rounded />
            <Field label="Description" name="description" id="permissionset_description" component={TextArea} required fullWidth rounded />
          </section>
          <UserPermissions sectionHeading="Contains" availablePermissions={[]} />
        </form>
      </Pane>
    );
  }
}

PermissionSetDetails.propTypes = propTypes;

export default reduxForm({
  form: 'permissionSetForm',
  enableReinitialize: true
})(PermissionSetDetails);

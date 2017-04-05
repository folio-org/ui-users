import React, { Component, PropTypes } from 'react';
import { connect } from '@folio/stripes-connect'; // eslint-disable-line
import Pane from '@folio/stripes-components/lib/Pane';
import Textfield from '@folio/stripes-components/lib/TextField';
import TextArea from '@folio/stripes-components/lib/TextArea';
import Button from '@folio/stripes-components/lib/Button';

import {Field, reducer as formReducer, reduxForm} from 'redux-form';
 
import PermissionSet from './PermissionSet';

class PermissionSetDetails extends Component {

  static propTypes = {
    stripes: PropTypes.shape({
      hasPerm: PropTypes.func.isRequired,
    }).isRequired,
    initialValues: PropTypes.object
  };

  static manifest = Object.freeze({
     availablePermissions: {
      type: 'okapi',
      records: 'permissions',
      PUT: {
        pk: 'id',
        path: 'perms/permissions/'
      }
    }
  });

  constructor(props) {
    super(props);
    this.validateSet = this.validateSet.bind(this);
    this.saveSet = this.saveSet.bind(this);
    this.beginDelete = this.beginDelete.bind(this);
    this.confirmDeleteSet = this.confirmDeleteSet.bind(this);

    this.state = {
      confirmDelete: false,
    };

  }

  validateSet(newValue, dirtySet, props) {
    this.setState({ 
      selectedSet: dirtySet 
    });  
  }

  saveSet() {
    this.props.parentMutator.permissionSets.PUT(this.state.selectedSet);
  }

  beginDelete() {
    this.setState({
      confirmDelete: true,
    });
  }

  confirmDeleteSet(confirmation) {

    if(confirmation) {
      this.props.parentMutator.permissionSets.DELETE(this.props.selectedSet).then(()=>{
        this.props.clearSelection();
      });  
    } else {
      this.setState({
        confirmDelete: false,
      });
    }
    
  }

  render() {
    const { selectedSet, handleSubmit } = this.props;
    return (
      <Pane paneTitle={"Permission Set "+selectedSet.displayName?selectedSet.displayName:selectedSet.permissionName} defaultWidth="fill" >
        <form>
          <section>
            <h2 style={{ marginTop: '0' }}>About</h2>
            <Field label="Title" name="displayName" id="displayName" component={Textfield} required fullWidth rounded validate={this.validateSet} onBlur={this.saveSet} />
            <Field label="Description" name="description" id="permissionset_description" component={TextArea} validate={this.validateSet} onBlur={this.saveSet} required fullWidth rounded />
          </section>

          <Button title="Delete Permission Set" onClick={this.beginDelete} disabled={this.state.confirmDelete}> Delete Set </Button>
          {this.state.confirmDelete && <div> 
             <Button title="Confirm Delete Permission Set" onClick={()=>{this.confirmDeleteSet(true)}} > Confirm </Button>
              <Button title="Cancel Delete Permission Set" onClick={()=>{this.confirmDeleteSet(false)}}> Cancel </Button>
          </div>}
          <PermissionSet selectedSet="selectedSet" stripes={this.props.stripes} {...this.props} />
        </form>
      </Pane>
    );
  }
}

export default reduxForm({
  form: 'permissionSetForm',
  enableReinitialize: true
})(connect(PermissionSetDetails, '@folio/users'));

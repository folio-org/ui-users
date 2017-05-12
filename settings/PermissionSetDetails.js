// We have to remove node_modules/react to avoid having multiple copies loaded.
// eslint-disable-next-line import/no-unresolved
import React, { Component, PropTypes } from 'react';
import Pane from '@folio/stripes-components/lib/Pane';
import Textfield from '@folio/stripes-components/lib/TextField';
import TextArea from '@folio/stripes-components/lib/TextArea';
import Button from '@folio/stripes-components/lib/Button';
import IfPermission from '@folio/stripes-components/lib/IfPermission';

import { Field, reduxForm } from 'redux-form';

import PermissionSet from './PermissionSet';

class PermissionSetDetails extends Component {

  static propTypes = {
    stripes: PropTypes.shape({
      hasPerm: PropTypes.func.isRequired,
      connect: PropTypes.func.isRequired,
    }).isRequired,
    clearSelection: PropTypes.func.isRequired,
    selectedSet: PropTypes.object,
    parentMutator: PropTypes.shape({
      permissionSets: PropTypes.shape({
        DELETE: PropTypes.func.isRequired,
        PUT: PropTypes.func.isRequired,
      }),
    }),
  };

  constructor(props) {
    super(props);

    this.validateSet = this.validateSet.bind(this);
    this.saveSet = this.saveSet.bind(this);
    this.beginDelete = this.beginDelete.bind(this);
    this.confirmDeleteSet = this.confirmDeleteSet.bind(this);
    this.addPermission = this.addPermission.bind(this);
    this.removePermission = this.removePermission.bind(this);

    this.connectedPermissionSet = props.stripes.connect(PermissionSet);

    this.state = {
      confirmDelete: false,
    };
  }

  validateSet(newValue, dirtySet) {
    this.setState({
      selectedSet: dirtySet,
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
    if (confirmation) {
      this.props.parentMutator.permissionSets.DELETE(this.props.selectedSet).then(() => {
        this.props.clearSelection();
      });
    } else {
      this.setState({
        confirmDelete: false,
      });
    }
  }

  addPermission(perm) {
    this.state.selectedSet.subPermissions.push(perm);
    this.saveSet();
  }

  removePermission(perm) {
    const selectedSetSubPermissions = this.state.selectedSet.subPermissions;
    selectedSetSubPermissions.splice(selectedSetSubPermissions.indexOf(perm), 1);
    this.saveSet();
  }

  render() {
    const { selectedSet, stripes } = this.props;
    const disabled = !stripes.hasPerm('perms.permissions.item.put');

    return (
      <Pane paneTitle={`Permission Set ${selectedSet.displayName || selectedSet.permissionName}`} defaultWidth="fill" fluidContentWidth>
        <form>

          <section>
            <h2 style={{ marginTop: '0' }}>About</h2>
            <Field label="Title" name="displayName" id="displayName" component={Textfield} required fullWidth rounded validate={this.validateSet} onBlur={this.saveSet} disabled={disabled} />
            <Field label="Description" name="description" id="permissionset_description" component={TextArea} validate={this.validateSet} onBlur={this.saveSet} required fullWidth rounded disabled={disabled} />
          </section>

          <IfPermission {...this.props} perm="perms.permissions.item.delete">
            <Button title="Delete Permission Set" onClick={this.beginDelete} disabled={this.state.confirmDelete}> Delete Set </Button>
          </IfPermission>
          {this.state.confirmDelete && <div>
            <Button title="Confirm Delete Permission Set" onClick={() => { this.confirmDeleteSet(true); }}>Confirm</Button>
            <Button title="Cancel Delete Permission Set" onClick={() => { this.confirmDeleteSet(false); }}>Cancel</Button>
          </div>}

          <this.connectedPermissionSet
            addPermission={this.addPermission}
            removePermission={this.removePermission}
            selectedSet={selectedSet}
            permToRead="perms.permissions.get"
            permToDelete="perms.users.item.put"
            permToModify="perms.users.item.put"
            stripes={this.props.stripes}
            {...this.props}
          />

        </form>
      </Pane>
    );
  }
}

export default reduxForm({
  form: 'permissionSetForm',
  enableReinitialize: true,
})(PermissionSetDetails);

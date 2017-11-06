import React from 'react';
import PropTypes from 'prop-types';
import Pane from '@folio/stripes-components/lib/Pane';
import Textfield from '@folio/stripes-components/lib/TextField';
import TextArea from '@folio/stripes-components/lib/TextArea';
import Button from '@folio/stripes-components/lib/Button';
import Paneset from '@folio/stripes-components/lib/Paneset';
import PaneMenu from '@folio/stripes-components/lib/PaneMenu';
import IfPermission from '@folio/stripes-components/lib/IfPermission';
import ConfirmationModal from '@folio/stripes-components/lib/structures/ConfirmationModal';
import stripesForm from '@folio/stripes-form';
import { Field } from 'redux-form';

import ContainedPermissions from './ContainedPermissions';

class PermissionSetForm extends React.Component {

  static propTypes = {
    stripes: PropTypes.shape({
      hasPerm: PropTypes.func.isRequired,
      connect: PropTypes.func.isRequired,
    }).isRequired,
    initialValues: PropTypes.object,
    handleSubmit: PropTypes.func.isRequired,
    onSave: PropTypes.func,
    onCancel: PropTypes.func,
    onRemove: PropTypes.func,
    pristine: PropTypes.bool,
    submitting: PropTypes.bool,
    change: PropTypes.func,
  };

  constructor(props) {
    super(props);

    this.saveSet = this.saveSet.bind(this);
    this.beginDelete = this.beginDelete.bind(this);
    this.confirmDeleteSet = this.confirmDeleteSet.bind(this);
    this.addPermission = this.addPermission.bind(this);
    this.removePermission = this.removePermission.bind(this);

    this.containedPermissions = props.stripes.connect(ContainedPermissions);
  }

  componentWillMount() {
    this.setPermSet(this.props.initialValues);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.initialValues !== this.props.initialValues) {
      this.setPermSet(nextProps.initialValues);
    }
  }

  setPermSet(permSet) {
    this.setState({
      confirmDelete: false,
      selectedSet: Object.assign({ subPermissions: [] }, permSet),
    });
  }

  saveSet(data) {
    const selectedSet = this.state.selectedSet;
    const permSet = Object.assign({}, selectedSet, data, {
      mutable: true,
      subPermissions: (selectedSet.subPermissions || []).map(p => p.permissionName),
    });

    this.props.onSave(permSet);
  }

  beginDelete() {
    this.setState({
      confirmDelete: true,
    });
  }

  confirmDeleteSet(confirmation) {
    const { selectedSet } = this.state;
    if (confirmation) {
      this.props.onRemove(selectedSet);
    } else {
      this.setState({ confirmDelete: false });
    }
  }

  addPermission(perm) {
    const subPermissions = this.state.selectedSet.subPermissions.concat([perm]);
    this.updatePermSet(subPermissions);
  }

  removePermission(perm) {
    const subPermissions = this.state.selectedSet.subPermissions.filter(p => p !== perm);
    this.updatePermSet(subPermissions);
  }

  updatePermSet(subPermissions) {
    const selectedSet = Object.assign({}, this.state.selectedSet, { subPermissions });
    this.setState({ selectedSet });
    this.props.change('permissionsDirty', true);
  }

  addFirstMenu() {
    return (
      <PaneMenu>
        <button id="clickable-close-permission-set" onClick={this.props.onCancel} title="close" aria-label="Close Permission Set Dialog">
          <span style={{ fontSize: '30px', color: '#999', lineHeight: '18px' }} >&times;</span>
        </button>
      </PaneMenu>
    );
  }

  saveLastMenu() {
    const { pristine, submitting } = this.props;

    return (
      <PaneMenu>
        <Button
          id="clickable-save-permission-set"
          type="submit"
          title="Save and close"
          disabled={(pristine || submitting)}
        >Save and close</Button>
      </PaneMenu>
    );
  }

  render() {
    const { stripes, handleSubmit } = this.props;
    const { selectedSet, confirmDelete } = this.state;
    const disabled = !stripes.hasPerm('perms.permissions.item.put');
    const paneTitle = selectedSet.id ? 'Edit Permission Set' : 'New Permission Set';

    return (
      <form id="form-policy" onSubmit={handleSubmit(this.saveSet)}>
        <Paneset isRoot>
          <Pane defaultWidth="100%" firstMenu={this.addFirstMenu()} lastMenu={this.saveLastMenu()} paneTitle={paneTitle}>
            <section>
              <h2 style={{ marginTop: '0' }}>About</h2>
              <Field label="Title" name="displayName" id="displayName" component={Textfield} autoFocus required fullWidth rounded disabled={disabled} />
              <Field label="Description" name="description" id="permissionset_description" component={TextArea} fullWidth rounded disabled={disabled} />
              <Field name="permissionsDirty" component={Textfield} style={{ display: 'none' }} />
            </section>

            {selectedSet.id &&
              <IfPermission perm="perms.permissions.item.delete">
                <Button title="Delete Permission Set" onClick={this.beginDelete} disabled={confirmDelete}> Delete Set </Button>
              </IfPermission>
            }

            <ConfirmationModal
              open={confirmDelete}
              heading="Delete Permission Set?"
              message={(<span><strong>{selectedSet.displayName || 'Untitled Permission Set'}</strong> will be <strong>removed</strong> from permission sets.</span>)}
              onConfirm={() => { this.confirmDeleteSet(true); }}
              onCancel={() => { this.confirmDeleteSet(false); }}
              confirmLabel="Delete"
            />

            <this.containedPermissions
              addPermission={this.addPermission}
              removePermission={this.removePermission}
              selectedSet={selectedSet}
              permToRead="perms.permissions.get"
              permToDelete="perms.permissions.item.put"
              permToModify="perms.permissions.item.put"
              stripes={this.props.stripes}
              editable
              {...this.props}
            />
          </Pane>
        </Paneset>
      </form>
    );
  }
}

export default stripesForm({
  form: 'permissionSetForm',
  navigationCheck: true,
  enableReinitialize: false,
})(PermissionSetForm);

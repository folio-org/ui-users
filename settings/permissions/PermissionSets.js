import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import EntrySelector from '@folio/stripes-components/lib/EntrySelector';
import IfPermission from '@folio/stripes-components/lib/IfPermission';
import Callout from '@folio/stripes-components/lib/Callout';
import PaneMenu from '@folio/stripes-components/lib/PaneMenu';
import Button from '@folio/stripes-components/lib/Button';
import Layer from '@folio/stripes-components/lib/Layer';
import queryString from 'query-string';

import PermissionSetDetails from './PermissionSetDetails';
import PermissionSetForm from './PermissionSetForm';

class PermissionSets extends React.Component {
  static propTypes = {
    label: PropTypes.string.isRequired,
    stripes: PropTypes.shape({
      hasPerm: PropTypes.func.isRequired,
    }).isRequired,
    resources: PropTypes.shape({
      permissionSets: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }).isRequired,
    mutator: PropTypes.shape({
      permissionSets: PropTypes.shape({
        POST: PropTypes.func,
        DELETE: PropTypes.func,
      }),
    }).isRequired,
  };

  static manifest = Object.freeze({
    permissionSets: {
      type: 'okapi',
      records: 'permissions',
      DELETE: {
        path: 'perms/permissions',
      },
      POST: {
        path: 'perms/permissions',
      },
      GET: {
        path: 'perms/permissions?length=1000&query=(mutable=true)&expandSubs=true',
      },
      path: 'perms/permissions',
    },
  });

  constructor(props) {
    super(props);

    this.onAdd = this.onAdd.bind(this);
    this.onEdit = this.onEdit.bind(this);
    this.onSave = this.onSave.bind(this);
    this.onRemove = this.onRemove.bind(this);
    this.onCancel = this.onCancel.bind(this);

    const path = props.location.pathname;
    const selectedId = (/loan-policies\//.test(path))
      ? /permissions\/(.*)$/.exec(path)[1]
      : null;

    this.state = { selectedId };
    this.permissionSetsCallout = null;
  }

  onAdd() {
    this.showLayer('add');
  }

  onEdit(permSet) {
    this.setState({ selectedId: permSet.id });
    this.showLayer('edit');
  }

  onRemove(permSet) {
    return this.props.mutator.permissionSets.DELETE(permSet).then(() =>{
      this.hideLayer();
    });
  }

  onCancel(e) {
    e.preventDefault();
    this.hideLayer();
  }

  onSave(permSet) {
    const action = (permSet.id) ? 'PUT' : 'POST';
    return this.props.mutator.permissionSets[action](permSet)
      .then(() => this.hideLayer());
  }

  showLayer(name) {
    this.props.history.push(`${this.props.location.pathname}?layer=${name}`);
  }

  hideLayer() {
    this.props.history.push(`${this.props.location.pathname}`);
  }

  render() {
    const { resources, location, stripes } = this.props;
    const permissionSets = (resources.permissionSets || {}).records || [];
    const permissions = _.sortBy(permissionSets, ['name']);
    const container = document.getElementById('ModuleContainer');
    const query = location.search ? queryString.parse(location.search) : {};
    const selectedItem = (query.layer === 'edit')
      ? _.find(permissionSets, p => p.id === this.state.selectedId) : {};

    if (!container) return (<div />);

    const addMenu = (
      <IfPermission perm="perms.permissions.item.post">
        {/* In practice, there is point letting someone create a set if they can't set its name */}
        <IfPermission perm="perms.permissions.item.put">
          <PaneMenu>
            <Button title="Add Permission Set" onClick={this.onAdd} buttonStyle="primary paneHeaderNewButton">
              + New
            </Button>
          </PaneMenu>
        </IfPermission>
      </IfPermission>
    );

    return (
      <EntrySelector
        {...this.props}
        onAdd={this.onAdd}
        onEdit={this.onEdit}
        detailComponent={PermissionSetDetails}
        contentData={permissions}
        parentMutator={this.props.mutator}
        paneTitle="Permission Sets"
        detailPaneTitle="Permission Set Details"
        nameKey="displayName"
        paneWidth="70%"
        addMenu={addMenu}
      >
        <Layer isOpen={!!(query.layer)} label="Edit Permission Set" container={container}>
          <PermissionSetForm
            initialValues={selectedItem}
            stripes={stripes}
            callout={this.permissionSetsCallout}
            onSave={this.onSave}
            onCancel={this.onCancel}
            onRemove={this.onRemove}
          />
          <Callout ref={(ref) => { this.permissionSetsCallout = ref; }} />
        </Layer>

      </EntrySelector>
    );
  }
}

export default PermissionSets;

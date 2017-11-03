import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import EntryManager from '@folio/stripes-smart-components/lib/EntryManager';
import PermissionSetDetails from './PermissionSetDetails';
import PermissionSetForm from './PermissionSetForm';

class PermissionSets extends React.Component {
  static propTypes = {
    label: PropTypes.string.isRequired,
    resources: PropTypes.shape({
      entries: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }).isRequired,
    mutator: PropTypes.shape({
      permissionSets: PropTypes.shape({
        POST: PropTypes.func,
        PUT: PropTypes.func,
        DELETE: PropTypes.func,
      }),
    }).isRequired,
  };

  static manifest = Object.freeze({
    entries: {
      type: 'okapi',
      records: 'permissions',
      DELETE: {
        path: 'perms/permissions',
      },
      POST: {
        path: 'perms/permissions',
      },
      PUT: {
        path: 'perms/permissions',
      },
      GET: {
        path: 'perms/permissions?length=1000&query=(mutable=true)&expandSubs=true',
      },
      path: 'perms/permissions',
    },
  });

  render() {
    return (
      <EntryManager
        {...this.props}
        parentMutator={this.props.mutator}
        entryList={_.sortBy((this.props.resources.entries || {}).records || [], ['displayName'])}
        detailComponent={PermissionSetDetails}
        paneTitle={this.props.label}
        entryLabel="Permission Set"
        entryFormComponent={PermissionSetForm}
        nameKey="displayName"
        permissions={{
          put: 'perms.permissions.item.post',
          post: 'perms.permissions.item.post',
          delete: 'perms.permissions.item.delete',
        }}
      />
    );
  }
}

export default PermissionSets;

import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { IfPermission, IfInterface } from '@folio/stripes/core';

import EditablePermissions from '../../EditablePermissions';

const propTypes = {
  stripes: PropTypes.object.isRequired,
  resources: PropTypes.shape({
    availablePermissions: PropTypes.shape({
      records: PropTypes.arrayOf(PropTypes.object),
    }),
  }).isRequired,
  userPermissions: PropTypes.arrayOf(PropTypes.object),
};

class EditUserPerms extends React.Component {
  static manifest = Object.freeze({
    availablePermissions: {
      type: 'okapi',
      records: 'permissions',
      path: 'perms/permissions?length=1000',
      permissionsRequired: 'perms.permissions.get'
    },
  });

  render() {
    const { resources, userPermissions } = this.props;
    const availablePermissions = (resources.availablePermissions || {}).records || [];

    return (
      <IfPermission perm="perms.users.get,perms.permissions.get">
        <IfInterface name="permissions" version="5.0">
          <EditablePermissions
            {...this.props}
            heading={<FormattedMessage id="ui-users.permissions.userPermissions" />}
            permToRead="perms.users.get"
            permToDelete="perms.users.item.delete"
            permToModify="perms.users.item.post"
            availablePermissions={availablePermissions}
            listedPermissions={userPermissions}
          />
        </IfInterface>
      </IfPermission>
    );
  }
}

EditUserPerms.propTypes = propTypes;

export default EditUserPerms;

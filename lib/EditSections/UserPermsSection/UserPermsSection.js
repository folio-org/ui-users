import React from 'react';
import PropTypes from 'prop-types';
import IfPermission from '@folio/stripes-components/lib/IfPermission';
import IfInterface from '@folio/stripes-components/lib/IfInterface';

import EditablePermissions from '../../EditablePermissions';

const propTypes = {
  resources: PropTypes.shape({
    availablePermissions: PropTypes.shape({
      records: PropTypes.arrayOf(PropTypes.object),
    }),
  }).isRequired,
  userPermissions: PropTypes.arrayOf(PropTypes.object),
};

class UserPermsSection extends React.Component {
  // NOTE: 'indexField', used as a parameter in the userPermissions paths,
  // modifies the API call so that the :{userid} parameter is actually
  // interpreted as a user ID. By default, that path component is taken as
  // the ID of the user/permission _object_ in /perms/users.
  static manifest = Object.freeze({
    availablePermissions: {
      type: 'okapi',
      records: 'permissions',
      path: 'perms/permissions?length=1000',
    },
  });

  render() {
    const { resources, userPermissions } = this.props;
    const availablePermissions = (resources.availablePermissions || {}).records || [];

    return (
      <IfPermission perm="perms.users.get">
        <IfInterface name="permissions" version="5.0">
          <EditablePermissions
            {...this.props}
            heading="User Permissions"
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

UserPermsSection.propTypes = propTypes;

export default UserPermsSection;

// We have to remove node_modules/react to avoid having multiple copies loaded.
// eslint-disable-next-line import/no-unresolved
import React, { PropTypes } from 'react';
import RenderPermissions from './lib/RenderPermissions';

const propTypes = {
  data: PropTypes.shape({
    userPermissions: PropTypes.arrayOf(PropTypes.object),
  }).isRequired,
  mutator: PropTypes.shape({
    userPermissions: PropTypes.shape({
      POST: PropTypes.func.isRequired,
      DELETE: PropTypes.func.isRequired,
    }),
  }),
  viewUserProps: PropTypes.shape({
  }),
};

class UserPermissions extends React.Component {
  static manifest = Object.freeze({
    userPermissions: {
      type: 'okapi',
      records: 'permissionNames',
      DELETE: {
        pk: 'permissionName',
        path: 'perms/users/:{username}/permissions',
      },
      GET: {
        path: 'perms/users/:{username}/permissions?full=true',
      },
      path: 'perms/users/:{username}/permissions',
    },
  });

  constructor(props) {
    super(props);

    this.addPermission = this.addPermission.bind(this);
    this.removePermission = this.removePermission.bind(this);
  }

  addPermission(perm) {
    this.props.mutator.userPermissions.POST(perm, this.props.viewUserProps);
  }

  removePermission(perm) {
    this.props.mutator.userPermissions.DELETE(perm, this.props.viewUserProps, perm.permissionName);
  }

  render() {
    const { userPermissions } = this.props.data;

    return (<RenderPermissions
      {...this.props}
      heading="User Permissions"
      addPermission={this.addPermission}
      removePermission={this.removePermission}
      listedPermissions={userPermissions}
    />);
  }
}

UserPermissions.propTypes = propTypes;

export default UserPermissions;

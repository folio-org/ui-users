import React from 'react';
import PropTypes from 'prop-types';
import RenderPermissions from './lib/RenderPermissions';

const propTypes = {
  userPermissions: PropTypes.arrayOf(PropTypes.object),
};

const UserPermissions = (props) => {
  const { userPermissions } = props;

  return (<RenderPermissions
    {...props}
    heading="User Permissions"
    permToRead="perms.users.get"
    listedPermissions={userPermissions}
  />);
};

UserPermissions.propTypes = propTypes;

export default UserPermissions;

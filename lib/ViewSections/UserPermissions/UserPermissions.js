import React from 'react';
import PropTypes from 'prop-types';
import RenderPermissions from '../../RenderPermissions';

const propTypes = {
  userPermissions: PropTypes.arrayOf(PropTypes.object),
};

const UserPermissions = (props) => {
  const { userPermissions } = props;

  return (<RenderPermissions
    {...props}
    heading="User permissions"
    permToRead="perms.users.get"
    listedPermissions={userPermissions}
  />);
};

UserPermissions.propTypes = propTypes;

export default UserPermissions;

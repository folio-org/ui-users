import React from 'react';
import PropTypes from 'prop-types';
import RenderPermissions from '../../RenderPermissions';

const propTypes = {
  userPermissions: PropTypes.arrayOf(PropTypes.object),
  stripes: PropTypes.shape({
    intl: PropTypes.object.isRequired,
  }).isRequired,
};

const UserPermissions = (props) => {
  const { userPermissions, stripes: { intl } } = props;

  return (<RenderPermissions
    {...props}
    heading={intl.formatMessage({ id: 'ui-users.permissions.userPermissions' })}
    permToRead="perms.users.get"
    listedPermissions={userPermissions}
  />);
};

UserPermissions.propTypes = propTypes;

export default UserPermissions;

import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import RenderPermissions from '../../RenderPermissions';

const propTypes = {
  userPermissions: PropTypes.arrayOf(PropTypes.object),
  stripes: PropTypes.object.isRequired,
};

const UserPermissions = (props) => {
  const { userPermissions } = props;

  return (<RenderPermissions
    {...props}
    heading={<FormattedMessage id="ui-users.permissions.userPermissions" />}
    permToRead="perms.users.get"
    listedPermissions={userPermissions}
  />);
};

UserPermissions.propTypes = propTypes;

export default UserPermissions;

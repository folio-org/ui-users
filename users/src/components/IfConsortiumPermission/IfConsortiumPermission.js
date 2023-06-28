import React from 'react';
import PropTypes from 'prop-types';

import { useConsortiumPermissions } from '../../hooks';

const IfConsortiumPermission = ({ perm, children }) => {
  const { permissions } = useConsortiumPermissions();

  if (!permissions[perm]) return null;

  return children;
};

IfConsortiumPermission.propTypes = {
  perm: PropTypes.string.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.node,
  ]),
};

export default IfConsortiumPermission;

import React, { useEffect, useState } from 'react';

import { useStripes } from '@folio/stripes/core';
import { isEmpty } from 'lodash';
import { useUserTenantRoles } from '../../hooks';

const withUserRoles = (WrappedComponent) => (props) => {
  const { okapi } = useStripes();
  // eslint-disable-next-line react/prop-types
  const userId = props.match.params.id;
  const [assignedRoleIds, setAssignedRoleIds] = useState([]);
  const { userRoles, isLoading } = useUserTenantRoles({ userId, tenantId: okapi.tenant });

  useEffect(() => {
    if (!isEmpty(userRoles) && !isLoading) {
      setAssignedRoleIds(userRoles.map(({ id }) => id));
    }
  }, [isLoading, userRoles]);

  return <WrappedComponent
    {...props}
    isRolesLoading={isLoading}
    userRoles={userRoles}
    assignedRoleIds={assignedRoleIds}
    setAssignedRoleIds={setAssignedRoleIds}
  />;
};

export default withUserRoles;

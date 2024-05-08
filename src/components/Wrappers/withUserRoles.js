import React, { useEffect, useState } from 'react';

import { useStripes, useOkapiKy } from '@folio/stripes/core';

const withUserRoles = (WrappedComponent) => (props) => {
  const { okapi, config } = useStripes();
  // eslint-disable-next-line react/prop-types
  const userId = props.match.params.id;
  const [assignedRoleIds, setAssignedRoleIds] = useState([]);

  const searchParams = {
    limit: config.maxUnpagedResourceCount,
    query: `userId==${userId}`,
  };

  const ky = useOkapiKy();
  const api = ky.extend({
    hooks: {
      beforeRequest: [(req) => req.headers.set('X-Okapi-Tenant', okapi.tenant)]
    }
  });

  useEffect(() => {
    api.get(
      'roles/users', { searchParams },
    )
      .json()
      .then(data => setAssignedRoleIds(data.userRoles.map(({ roleId }) => roleId)))
      // eslint-disable-next-line no-console
      .catch(console.error);
    // Only userId can be changed dynamically
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const updateUserRoles = (roleIds) => api.put(
    `roles/users/${userId}`, { json: {
      userId,
      roleIds
    } },
  ).json()
  // eslint-disable-next-line no-console
    .catch(console.error);

  return <WrappedComponent
    {...props}
    assignedRoleIds={assignedRoleIds}
    setAssignedRoleIds={setAssignedRoleIds}
    updateUserRoles={updateUserRoles}
  />;
};

export default withUserRoles;

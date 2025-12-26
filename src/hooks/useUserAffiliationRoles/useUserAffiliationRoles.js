import { useMemo } from 'react';
import { useQuery } from 'react-query';

import { useStripes, useOkapiKy, useNamespace } from '@folio/stripes/core';

import useAllRolesData from '../useAllRolesData/useAllRolesData';

const DEFAULT = [];

function useUserAffiliationRoles(userId, tenantId) {
  const stripes = useStripes();
  const [namespace] = useNamespace({ key: 'user-affiliation-roles' });
  const ky = useOkapiKy({ tenant: tenantId });

  const hasViewRolesPermission = stripes.hasPerm('ui-users.roles.view');

  // Since `roles/users` return doesn't include names (only ids) for the roles, and we need them sorted by role name,
  // we need to retrieve all the records for roles and use them to determine the sequence of ids.
  const {
    isLoading: isAllRolesDataLoading,
    isFetching: isAllRolesDataFetching,
    allRolesMapStructure,
  } = useAllRolesData({ tenantId, enabled: hasViewRolesPermission });

  const {
    data,
    isLoading: isUserRolesLoading,
    isFetching: isUserRolesFetching,
  } = useQuery(
    [namespace, userId, tenantId],
    () => ky.get(`roles/users/${userId}`).json(),
    {
      enabled: Boolean(userId && tenantId && hasViewRolesPermission),
    }
  );

  const userRoleIds = useMemo(() => {
    if (!data?.userRoles || !allRolesMapStructure.size) return DEFAULT;

    return data.userRoles
      .map(({ roleId }) => allRolesMapStructure.get(roleId))
      .toSorted((a, b) => a.name.localeCompare(b.name))
      .map(({ id }) => id);
  }, [data?.userRoles, allRolesMapStructure]);

  return {
    userRoleIds,
    isLoading: isUserRolesLoading || isAllRolesDataLoading,
    isFetching: isUserRolesFetching || isAllRolesDataFetching,
  };
}

export default useUserAffiliationRoles;

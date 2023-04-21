import { useQuery } from 'react-query';

import {
  useNamespace,
  useOkapiKy,
} from '@folio/stripes/core';

const INITIAL_DATA = [];

const useUserTenantPermissions = (
  { userId, tenantId },
  options = {},
) => {
  const ky = useOkapiKy();
  const api = ky.extend({
    hooks: {
      beforeRequest: [(req) => req.headers.set('X-Okapi-Tenant', tenantId)]
    }
  });
  const [namespace] = useNamespace({ key: 'user-affiliation-permissions' });

  const searchParams = {
    full: 'true',
    indexField: 'userId',
  };

  const {
    isFetching,
    isLoading,
    data = {},
  } = useQuery(
    [namespace, userId, tenantId],
    ({ signal }) => {
      return api.get(
        `perms/users/${userId}/permissions`,
        {
          searchParams,
          signal,
        },
      ).json();
    },
    {
      enabled: Boolean(userId && tenantId),
      keepPreviousData: true,
      ...options,
    },
  );

  return ({
    isFetching,
    isLoading,
    userPermissions: data.permissionNames || INITIAL_DATA,
    totalRecords: data.totalRecords,
  });
};

export default useUserTenantPermissions;

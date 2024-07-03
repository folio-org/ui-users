import { useQuery } from 'react-query';

import {
  useChunkedCQLFetch,
  useNamespace,
  useStripes,
  useOkapiKy,
} from '@folio/stripes/core';

/**
 * chunkedRolesReducer
 * reducer for useChunkedCQLFetch. Given input
 *   [
 *     { data: { roles: [1, 2, 3] } },
 *     { data: { roles: [4, 5, 6] } },
 *   ]
 * return
 *   [1, 2, 3, 4, 5, 6]
 *
 * @param {Array} list of chunks, each item shaped like { data: { roles: [] }}
 * @returns Array flattened array of role data
 */
export const chunkedRolesReducer = (list) => (
  list.reduce((acc, cur) => {
    return [...acc, ...(cur?.data?.roles ?? [])];
  }, []));

const useUserTenantRoles = (
  { userId, tenantId },
) => {
  const stripes = useStripes();
  const ky = useOkapiKy();
  const api = ky.extend({
    hooks: {
      beforeRequest: [(req) => req.headers.set('X-Okapi-Tenant', tenantId)]
    }
  });
  const [namespace] = useNamespace({ key: 'user-affiliation-roles' });

  const searchParams = {
    limit: stripes.config.maxUnpagedResourceCount,
    query: `userId==${userId}`,
  };

  // retrieve roles assigned to the user to get their IDs...
  const { data, isSuccess, refetch } = useQuery(
    [namespace, userId, tenantId],
    ({ signal }) => {
      return api.get(
        'roles/users',
        {
          searchParams,
          signal,
        },
      ).json();
    },
    {
      enabled: Boolean(userId && tenantId),
    }
  );

  // ... then retrieve corresponding role objects via chunked fetch
  // since the list may be long.
  const ids = isSuccess ? data.userRoles.map(i => i.roleId) : [];
  const {
    isFetching,
    isLoading,
    items: roles
  } = useChunkedCQLFetch({
    endpoint: 'roles',
    ids,
    queryEnabled: isSuccess,
    reduceFunction: chunkedRolesReducer,
  });

  return {
    userRoles: roles?.sort((a, b) => a.name.localeCompare(b.name)) || [],
    isFetching,
    isLoading,
    refetch
  };
};

export default useUserTenantRoles;

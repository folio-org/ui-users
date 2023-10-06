import { useQuery } from 'react-query';

import {
  useNamespace,
  useOkapiKy,
  useStripes,
} from '@folio/stripes/core';

import {
  PERMISSIONS_API,
} from '../constants';
import {
  batchRequest,
  buildQueryByUserIds,
} from '../../AssignedUsers/hooks/utils';

const DEFAULT_DATA = [];

const usePermissionSets = ({ userIds = DEFAULT_DATA }, options = {}) => {
  const stripes = useStripes();
  const tenantId = stripes.okapi?.tenant;

  const ky = useOkapiKy();
  const api = ky.extend({
    hooks: {
      beforeRequest: [(req) => req.headers.set('X-Okapi-Tenant', tenantId)],
    },
  });

  const [namespace] = useNamespace({ key: 'get-permission-sets' });

  const {
    isLoading,
    data = DEFAULT_DATA,
    refetch,
    isFetching,
  } = useQuery(
    [namespace, userIds],
    async ({ signal }) => {
      const permissionUsersResponse = await batchRequest(
        ({ params: searchParams }) => api
          .get(PERMISSIONS_API, { searchParams, signal })
          .json()
          .then(({ permissionUsers }) => permissionUsers),
        userIds,
        buildQueryByUserIds,
      );

      const permissionsList = permissionUsersResponse.flatMap(({ permissions }) => permissions);
      return permissionsList;
    },
    {
      enabled: Boolean(userIds.length),
      keepPreviousData: true,
      ...options,
    },
  );

  return ({
    refetch,
    isLoading,
    isFetching,
    permissions: data,
  });
};
export default usePermissionSets;

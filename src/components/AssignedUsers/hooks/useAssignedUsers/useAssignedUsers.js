import { useQuery } from 'react-query';

import {
  useNamespace,
  useOkapiKy,
  useStripes,
} from '@folio/stripes/core';

import { MAX_RECORDS } from '../../../../constants';
import {
  GROUPS_API,
  PERMISSIONS_API,
  USERS_API
} from '../../constants';
import {
  batchRequest,
  buildQueryByIds
} from '../utils';

const useAssignedUsers = ({ grantedToIds = [], permissionSetId, tenantId }, options = {}) => {
  const stripes = useStripes();
  const defaultTenantId = stripes.okapi?.tenant;

  const ky = useOkapiKy();
  const api = ky.extend({
    hooks: {
      beforeRequest: [(req) => req.headers.set('X-Okapi-Tenant', tenantId || defaultTenantId)]
    }
  });

  const [namespace] = useNamespace({ key: 'get-assigned-users' });
  const {
    isLoading,
    data = [],
    refetch,
    isFetching,
  } = useQuery(
    [namespace, permissionSetId],
    async ({ signal }) => {
      const permissionUsersResponse = await batchRequest(
        ({ params: searchParams }) => api
          .get(PERMISSIONS_API, { searchParams, signal })
          .json()
          .then(({ permissionUsers }) => permissionUsers),
        grantedToIds,
        buildQueryByIds,
      );

      const userIds = permissionUsersResponse.flatMap(({ userId }) => userId);

      const usersResponse = await batchRequest(
        ({ params: searchParams }) => api
          .get(USERS_API, { searchParams, signal })
          .json()
          .then(({ users }) => users),
        userIds,
        buildQueryByIds,
      );

      const patronGroups = await api
        .get(GROUPS_API, { searchParams: {
          limit: MAX_RECORDS,
        } })
        .json()
        .then(({ usergroups }) => usergroups);

      const patronGroupsById = patronGroups.reduce((acc, group) => {
        acc[group.id] = group.group;
        return acc;
      }, {});

      return usersResponse.map(({ personal, patronGroup, ...rest }) => ({
        ...rest,
        personal,
        patronGroup,
        fullName: [personal.firstName, personal.lastName].filter(Boolean).join(' '),
        groupName: patronGroupsById[patronGroup],
      }));
    },
    {
      enabled: Boolean(grantedToIds.length && permissionSetId),
      keepPreviousData: true,
      ...options,
    },
  );

  return ({
    refetch,
    isLoading,
    isFetching,
    users: data,
  });
};

export default useAssignedUsers;

import { useQuery } from 'react-query';

import {
  useNamespace,
  useOkapiKy,
} from '@folio/stripes/core';
import { batchRequest } from '@folio/stripes-acq-components';

const buildQueryByIds = (itemsChunk) => {
  const query = itemsChunk
    .map(chunkId => `id==${chunkId}`)
    .join(' or ');

  return query || '';
};

const useAssignedUsers = ({ grantedToIds = [], tenantId }, options = {}) => {
  const ky = useOkapiKy();
  const api = ky.extend({
    hooks: {
      beforeRequest: [(req) => req.headers.set('X-Okapi-Tenant', tenantId)]
    }
  });
  const [namespace] = useNamespace({ key: 'get-assigned-users' });
  const {
    isLoading,
    data = [],
  } = useQuery(
    [namespace, grantedToIds, tenantId],
    async ({ signal }) => {
      const permissionUsersResponse = await batchRequest(
        ({ params: searchParams }) => api
          .get('perms/users', { searchParams, signal })
          .json()
          .then(({ permissionUsers }) => permissionUsers),
        grantedToIds,
        buildQueryByIds,
      );

      const userIds = permissionUsersResponse.flatMap(({ userId }) => userId);

      const usersResponse = await batchRequest(
        ({ params: searchParams }) => api
          .get('users', { searchParams, signal })
          .json()
          .then(({ users }) => users),
        userIds,
        buildQueryByIds,
      );

      const usersData = usersResponse.flat();

      const patronGroupIds = usersData.map(({ patronGroup }) => patronGroup);

      const patronGroups = await batchRequest(
        ({ params: searchParams }) => api
          .get('groups', { searchParams, signal })
          .json()
          .then(({ usergroups }) => usergroups),
        patronGroupIds,
        buildQueryByIds,
      );

      const patronGroupsById = patronGroups.flat().reduce((acc, group) => {
        acc[group.id] = group.group;
        return acc;
      }, {});

      return usersResponse.map(({ personal, patronGroup }) => ({
        fullName: `${personal.firstName} ${personal.lastName}`,
        patronGroup: patronGroupsById[patronGroup],
      }));
    },
    {
      enabled: Boolean(grantedToIds.length && tenantId),
      keepPreviousData: true,
      ...options,
    },
  );

  return ({
    isLoading,
    users: data,
  });
};

export default useAssignedUsers;

import { useQuery } from 'react-query';

import {
  useNamespace,
  useOkapiKy,
} from '@folio/stripes/core';

import { MAX_RECORDS } from '../../../../constants';
import { GROUPS_API, PERMISSIONS_API, USERS_API } from '../../constants';
import { batchRequest, buildQueryByIds } from './utils';

const useAssignedUsers = ({ grantedToIds = [], tenantId }, options = {}) => {
  const ky = useOkapiKy();
  const [namespace] = useNamespace({ key: 'get-assigned-users' });
  const {
    isLoading,
    data = [],
  } = useQuery(
    [namespace, grantedToIds, tenantId],
    async ({ signal }) => {
      const permissionUsersResponse = await batchRequest(
        ({ params: searchParams }) => ky
          .get(PERMISSIONS_API, { searchParams, signal })
          .json()
          .then(({ permissionUsers }) => permissionUsers),
        grantedToIds,
        buildQueryByIds,
      );

      const userIds = permissionUsersResponse.flatMap(({ userId }) => userId);

      const usersResponse = await batchRequest(
        ({ params: searchParams }) => ky
          .get(USERS_API, { searchParams, signal })
          .json()
          .then(({ users }) => users),
        userIds,
        buildQueryByIds,
      );

      const patronGroups = await ky
        .get(GROUPS_API, { searchParams: {
          limit: MAX_RECORDS,
        } })
        .json()
        .then(({ usergroups }) => usergroups);

      const patronGroupsById = patronGroups.reduce((acc, group) => {
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

import { useQuery } from 'react-query';

import {
  useNamespace,
  useOkapiKy,
  useStripes,
} from '@folio/stripes/core';

import {
  MAX_RECORDS,
  OKAPI_TENANT_HEADER,
} from '../../constants';

const useConsortiumPermissions = () => {
  const stripes = useStripes();
  const ky = useOkapiKy();
  const [namespace] = useNamespace({ key: 'consortium-permissions' });

  const user = stripes?.user?.user;
  const consortium = user?.consortium;

  const enabled = Boolean(user?.id && consortium?.id);

  const {
    isLoading,
    data = {},
  } = useQuery(
    [namespace, user?.id],
    async () => {
      const api = ky.extend({
        hooks: {
          beforeRequest: [
            request => {
              request.headers.set(OKAPI_TENANT_HEADER, consortium.centralTenantId);
            },
          ],
        },
      });

      try {
        const { id } = await api.get(
          `perms/users/${user.id}`,
          { searchParams: { indexField: 'userId' } },
        ).json();
        const { permissions } = await api.get(
          'perms/permissions',
          { searchParams: { limit: MAX_RECORDS, query: `(grantedTo=${id})`, expanded: true } },
        ).json();

        return permissions
          .map(({ subPermissions = [] }) => subPermissions)
          .flat()
          .filter(permission => permission.includes('consortia'))
          .reduce((acc, permission) => {
            acc[permission] = true;

            return acc;
          }, {});
      } catch {
        return {};
      }
    },
    {
      enabled,
      staleTime: 10 * (60 * 1000),
      cacheTime: 15 * (60 * 1000),
    },
  );

  return { isLoading, permissions: data };
};

export default useConsortiumPermissions;

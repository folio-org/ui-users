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

/**
 * useConsortiumPermissions
 * Retrieve a list of consortia-related permissions assigned to the current
 * user in their central tenant.
 *
 * @returns {object} shaped like { foo: true, bar: true } where foo, bar are permissions
 */
const useConsortiumPermissions = () => {
  const stripes = useStripes();
  const ky = useOkapiKy();
  const [namespace] = useNamespace({ key: 'consortium-permissions' });

  const user = stripes?.user?.user;
  const consortium = user?.consortium;

  const enabled = Boolean(user?.id && consortium?.id);

  // retrieve permissions via permissions interface
  const permissionsPermissions = async (api) => {
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
  };

  // retrieve permissions via users-keycloak interface
  const capabilitiesPermissions = async (api) => {
    const { permissions } = await api.get(
      'users-keycloak/_self',
    ).json();

    return permissions?.permissions
      .filter(permission => permission.includes('consortia'))
      .reduce((acc, permission) => {
        acc[permission] = true;

        return acc;
      }, {});
  };

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
        return stripes.hasInterface('users-keycloak', '1.0') ? capabilitiesPermissions(api) : permissionsPermissions(api);
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

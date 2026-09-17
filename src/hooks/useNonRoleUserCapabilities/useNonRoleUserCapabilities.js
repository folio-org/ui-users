import { useMemo } from 'react';
import { useQuery } from 'react-query';

import {
  useChunkedCQLFetch,
  useNamespace,
  useOkapiKy,
} from '@folio/stripes/core';
import { CAPABILITIES_LIMIT, getCapabilitiesGroupedByTypeAndResource } from '@folio/stripes-authorization-components';

import useUserTenantRoles from '../useUserTenantRoles';

const userCapabilitiesSearchParams = {
  limit: CAPABILITIES_LIMIT,
  query: 'cql.allRecords=1 sortby resource',
  expand: true,
};

const reduceRoleCapabilities = (chunks) => chunks.flatMap((chunkResult) => chunkResult?.data?.capabilities || []);

/**
 * Get capabilities assigned to a user that aren't covered by any of their
 * currently-assigned roles.
 *
 * Note this is a UI-level concept, not the API's own `capability.direct` field:
 * that field only distinguishes a capability assigned straight to the user from
 * one inherited via a capability set assigned to the user - it says nothing about
 * role inheritance. To exclude role-covered capabilities, this hook instead looks
 * up the capabilities tied to each of the user's roles (via the `role` CQL field
 * on the capabilities collection, chunked since a user's role list can be long)
 * and subtracts them from the user's own capabilities.
 *
 * @param {string} userId The User ID.
 * @param {string} tenant The Tenant ID. Passes into `useOkapiKy` which will default to `stripes.okapi.tenant` if omitted.
 * @returns Capabilities assigned to the user that aren't also granted by one of their roles.
 */
const useNonRoleUserCapabilities = (userId, tenant = '') => {
  const ky = useOkapiKy({ tenant });
  const [namespace] = useNamespace({ key: 'non-role-user-capabilities' });

  const { data, isFetching: isUserCapabilitiesLoading } = useQuery({
    queryKey: [namespace, 'user', userId, tenant],
    queryFn: () => ky.get(`users/${userId}/capabilities`, { searchParams: userCapabilitiesSearchParams }).json(),
    enabled: Boolean(userId),
    placeholderData: { capabilities: [], totalRecords: 0 },
  });

  const { userRoles, isFetching: isRolesFetching } = useUserTenantRoles({ userId, tenantId: tenant });
  const roleIds = useMemo(() => userRoles.map(({ id }) => id), [userRoles]);

  const {
    items: roleCapabilities,
    isLoading: isRoleCapabilitiesLoading,
  } = useChunkedCQLFetch({
    endpoint: 'capabilities',
    idName: 'role',
    limit: CAPABILITIES_LIMIT,
    ids: roleIds,
    reduceFunction: reduceRoleCapabilities,
    tenantId: tenant,
  });

  const roleCapabilityIds = useMemo(
    () => new Set((roleCapabilities || []).map(({ id }) => id)),
    [roleCapabilities],
  );

  const nonRoleUserCapabilities = (data?.capabilities || []).filter((capability) => !roleCapabilityIds.has(capability.id));

  return {
    isLoading: isUserCapabilitiesLoading || isRolesFetching || isRoleCapabilitiesLoading,
    capabilitiesTotalCount: nonRoleUserCapabilities.length,
    groupedNonRoleUserCapabilitiesByType: getCapabilitiesGroupedByTypeAndResource(nonRoleUserCapabilities),
  };
};

export default useNonRoleUserCapabilities;

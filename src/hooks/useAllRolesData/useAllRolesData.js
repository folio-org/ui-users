import { useNamespace, useOkapiKy, useStripes } from '@folio/stripes/core';
import { useMemo } from 'react';
import { useQuery } from 'react-query';

/**
 * Custom React hook that fetches all roles data from the backend API.
 *
 * @return {Object} An object containing the fetched data, loading state, and a map structure of all roles.
 *  - data: An object containing `roles` and `totalRecords` fields, `roles` which is an array of roles. And `totalRecords` field, which is the total number of roles.
 *  - isLoading: A boolean indicating if the data is currently being fetched.
 *  - allRolesMapStructure: A Map object containing all roles, where the key is the role ID and the value is the role object.
 * Introduced this structure because iterating over allRoles data is expensive in nested loops. @example UserRolesModal, EditUserRoles.
 *  - isSuccess: A boolean indicating if the data fetch was successful.
 */

function useAllRolesData(options = {}) {
  const { 
    tenantId,
    enabled = true,
  } = options;
  const stripes = useStripes();
  const ky = useOkapiKy({ tenant: tenantId || stripes.okapi.tenant });

  const [namespace] = useNamespace({ key: 'tenant-roles' });

  const { data, isLoading, isSuccess, refetch, isFetching } = useQuery([namespace, tenantId], () => {
    return ky.get(`roles?limit=${stripes.config.maxUnpagedResourceCount}&query=cql.allRecords=1 sortby name`).json();
  }, { enabled: stripes.hasInterface('roles') && enabled });

  const allRolesMapStructure = useMemo(() => {
    const rolesMap = new Map();

    if (!data?.roles) return rolesMap;

    data.roles.forEach(role => rolesMap.set(role.id, role));
    return rolesMap;
  }, [data]);

  return { data, isLoading, allRolesMapStructure, isSuccess, refetch, isFetching };
}

export default useAllRolesData;

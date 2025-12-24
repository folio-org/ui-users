import { useMemo } from 'react';
import { useQuery } from 'react-query';

import { 
  useStripes,
  useOkapiKy,
  useNamespace,
} from '@folio/stripes/core';

import useAllRolesData from '../useAllRolesData/useAllRolesData';

const DEFAULT = [];

function useUserAffiliationRoles(userId, tenantId) {
  const stripes = useStripes();
  const [namespace] = useNamespace({ key: 'user-affiliation-roles' });
  const ky = useOkapiKy({ tenant: tenantId });

  const hasViewRolesPermission = stripes.hasPerm('ui-users.roles.view');

  const { 
    isLoading: isAllRolesDataLoading, 
    isFetching: isAllRolesDataFetching,
    allRolesMapStructure,
  } = useAllRolesData({ tenantId, enabled: hasViewRolesPermission });

  // const searchParams = {
  //   limit: stripes.config.maxUnpagedResourceCount,
  //   query: `userId==${userId}`,
  // };

  // // To unify in case if consortium of non-consortium
  // let tenants = stripes.user.user?.tenants || [{ id: stripes.okapi.tenant }];
  // // Only make API calls if user has permission to view roles
  // tenants = stripes.hasPerm('ui-users.roles.view') ? tenants : [];

  // console.log('stripes.okapi.tenant', stripes.okapi.tenant)

  const {
    data,
    isLoading: isUserRolesLoading,
    isFetching: isUserRolesFetching,
  } = useQuery(
    [namespace, userId, tenantId],
    () => ky.get(`roles/users/${userId}`).json(),
    {
      enabled: Boolean(userId && tenantId && hasViewRolesPermission),
    }
  );

  // const userTenantRolesQueries = useQueries(
  //   tenants.filter(tenant => tenant.id === stripes.okapi.tenant).map(({ id }) => {
  //     return {
  //       queryKey:['userTenantRoles', id],
  //       queryFn:() => {
  //         const api = ky.extend({
  //           hooks: {
  //             beforeRequest: [(req) => req.headers.set('X-Okapi-Tenant', id)]
  //           }
  //         });
  //         return api.get('roles/users', { searchParams }).json();
  //       },
  //       enabled: Boolean(userId)
  //     };
  //   })
  // );

  // const result = tenants.reduce((acc, value, index) => {
  //   acc[value.id] = userTenantRolesQueries[index].data?.userRoles.flatMap(d => d.roleId) || [];
  //    return acc;
  // }, {});

  // console.log('tenants', tenants)
  // console.log('userTenantRolesQueries', userTenantRolesQueries);
  // console.log('result', result);

  // const assignedRoles = useMemo(() => {
  //   return tenants
  //   .filter(tenant => tenant.id === stripes.okapi.tenant)
  //   .reduce((acc, value, index) => {
  //     // acc[value.id] = userTenantRolesQueries[index].data?.userRoles.flatMap(d => d.roleId) || [];
  //     acc[value.id] = userTenantRolesQueries[0].data?.userRoles.flatMap(d => d.roleId) || [];
  //     return acc;
  //   }, {});
  // }, [tenants, userTenantRolesQueries?.data?.userRoles]);

  // console.log('assignedRoles', assignedRoles)

  // return assignedRoles;

  // Since `roles/users` return doesn't include names (only ids) for the roles, and we need them sorted by role name,
  // we need to retrieve all the records for roles and use them to determine the sequence of ids.
  // const tenantRolesQueries = useQueries(
  //   tenants.map(({ id }) => {
  //     return {
  //       queryKey:['tenantRolesAllRecords', id],
  //       queryFn:() => {
  //         console.log('here1111')
  //         const api = ky.extend({
  //           hooks: {
  //             beforeRequest: [(req) => req.headers.set('X-Okapi-Tenant', id)]
  //           }
  //         });
  //         return api.get(`roles?limit=${stripes.config.maxUnpagedResourceCount}&query=cql.allRecords=1 sortby name`).json();
  //       },
  //     };
  //   })
  // );

  // // result from useQueries doesn’t provide information about the tenants, reach appropriate tenant using index
  // // useQueries guarantees that the results come in the same order as provided [queryFns]
  // return tenants.reduce((acc, tenant, index) => {
  //   const roleIds = userTenantRolesQueries[index].data?.userRoles.map(d => d.roleId) || [];
  //   const assignedRoles = [];
  //   roleIds.forEach(roleId => {
  //     const found = tenantRolesQueries[index].data?.roles.find(r => r.id === roleId);
  //     if (found) assignedRoles.push(found);
  //   });
  //   acc[tenant.id] = [...assignedRoles].sort((a, b) => a.name.localeCompare(b.name)).map(({ id }) => id);
  //   return acc;
  // }, {});

  // console.log('data123', data)

  const userRoleIds = useMemo(() => {
    // console.log('allRolesMapStructure', allRolesMapStructure.size)
    if (!data?.userRoles || !allRolesMapStructure.size) return DEFAULT;

    return data.userRoles
      .map(({ roleId }) => allRolesMapStructure.get(roleId))
      .toSorted((a, b) => a.name.localeCompare(b.name))
      .map(({ id }) => id);
  }, [data?.userRoles, allRolesMapStructure]);
    // console.log('123userRoleIds__', userRoleIds)

  return {
    userRoleIds,
    isLoading: isUserRolesLoading || isAllRolesDataLoading,
    isFetching: isUserRolesFetching || isAllRolesDataFetching,
  }
}

export default useUserAffiliationRoles;

// {
//     "college": [
//         "dd4bed4c-de80-47a7-a4a9-b0becc87e326"
//     ],
//     "consortium": [
//         "68ff2dca-1198-4961-acf3-9963dc1b7c8f",
//         "d63cf3d9-b63e-4e60-96e4-3a48423eb8e6",
//         "0bb299df-903b-43e0-9d28-3c1baaea13aa",
//         "9a844acb-06fe-4484-a64a-e0e36daf8d26"
//     ],
//     "university": []
// }


// {
//     "college": [
//         "dd4bed4c-de80-47a7-a4a9-b0becc87e326"
//     ],
//     "consortium": [
//         "68ff2dca-1198-4961-acf3-9963dc1b7c8f",
//         "0bb299df-903b-43e0-9d28-3c1baaea13aa",
//         "9a844acb-06fe-4484-a64a-e0e36daf8d26",
//         "d63cf3d9-b63e-4e60-96e4-3a48423eb8e6"
//     ],
//     "university": []
// }
import { useStripes, useOkapiKy } from '@folio/stripes/core';
import { useQueries } from 'react-query';

function useUserAffiliationRoles(userId) {
  const stripes = useStripes();

  const searchParams = {
    limit: stripes.config.maxUnpagedResourceCount,
    query: `userId==${userId}`,
  };

  // To unify in case if consortium of non-consortium
  const tenants = stripes.user.user?.tenants || [{ id: stripes.okapi.tenant }];
  const ky = useOkapiKy();

  const userTenantRolesQueries = useQueries(
    tenants.map(({ id }) => {
      return {
        queryKey:['userTenantRoles', id],
        queryFn:() => {
          const api = ky.extend({
            hooks: {
              beforeRequest: [(req) => req.headers.set('X-Okapi-Tenant', id)]
            }
          });
          return api.get('roles/users', { searchParams }).json();
        },
        enabled: Boolean(userId)
      };
    })
  );

  // Since `roles/users` return doesn't include names (only ids) for the roles, and we need them sorted by role name,
  // we need to retrieve all the records for roles and use them to determine the sequence of ids.
  const tenantRolesQueries = useQueries(
    tenants.map(({ id }) => {
      return {
        queryKey:['tenantRolesAllRecords', id],
        queryFn:() => {
          const api = ky.extend({
            hooks: {
              beforeRequest: [(req) => req.headers.set('X-Okapi-Tenant', id)]
            }
          });
          return api.get(`roles?limit=${stripes.config.maxUnpagedResourceCount}&query=cql.allRecords=1 sortby name`).json();
        },
      };
    })
  );

  // result from useQueries doesn’t provide information about the tenants, reach appropriate tenant using index
  // useQueries guarantees that the results come in the same order as provided [queryFns]
  return tenants.reduce((acc, tenant, index) => {
    const roleIds = userTenantRolesQueries[index].data?.userRoles.map(d => d.roleId) || [];
    const assignedRoles = [];
    roleIds.forEach(roleId => {
      const found = tenantRolesQueries[index].data?.roles.find(r => r.id === roleId);
      if (found) assignedRoles.push(found);
    });
    acc[tenant.id] = [...assignedRoles].sort((a, b) => a.name.localeCompare(b.name)).map(({ id }) => id);
    return acc;
  }, {});
}

export default useUserAffiliationRoles;

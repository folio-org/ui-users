import { useStripes, useOkapiKy } from '@folio/stripes/core';
import { useQueries } from 'react-query';

function useUserAffiliationRoles(userId) {
  const stripes = useStripes();

  const searchParams = {
    limit: stripes.config.maxUnpagedResourceCount,
    query: `userId==${userId}`,
  };

  // To unify in case if consortium of non-consortium
  let tenants = stripes.user.user?.tenants || [{ id: stripes.okapi.tenant }];
  // Only make API calls if user has permission to view roles
  tenants = stripes.hasPerm('ui-users.roles.view') ? tenants : [];
  const ky = useOkapiKy();

  const queries = useQueries(
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

  // result from useQueries doesn’t provide information about the tenants.
  // useQueries guarantees that the results come in the same order as provided [queryFns]
  return tenants.reduce((acc, value, index) => {
    acc[value.id] = queries[index].data?.userRoles.flatMap(d => d.roleId) || [];
    return acc;
  }, {});
}

export default useUserAffiliationRoles;

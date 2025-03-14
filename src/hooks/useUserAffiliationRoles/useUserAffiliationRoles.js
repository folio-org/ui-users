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

import { useStripes, useOkapiKy } from '@folio/stripes/core';
import { useQueries } from 'react-query';

import useUserAffiliations from '../useUserAffiliations';
import { isAffiliationsEnabled } from '../../components/util/util';

function useUserAffiliationRoles(userId, user) {
  const stripes = useStripes();
  const hasPerm = stripes.hasPerm('ui-users.roles.view');

  const {
    affiliations,
  } = useUserAffiliations({
    userId: user.id,
  }, {
    enabled: Boolean(hasPerm && isAffiliationsEnabled(user)),
  });

  const ky = useOkapiKy();

  const userTenantRolesQueries = useQueries(
    affiliations.map(({ tenantId: id }) => {
      return {
        queryKey:['userTenantRoles', id],
        queryFn:() => {
          const api = ky.extend({
            hooks: {
              beforeRequest: [(req) => req.headers.set('X-Okapi-Tenant', id)]
            }
          });
          return api.get(`roles/users/${userId}`).json();
        },
        enabled: Boolean(userId)
      };
    })
  );

  const userRoles = affiliations.reduce((acc, { tenantId }, index) => {
    acc[tenantId] = userTenantRolesQueries[index]?.data?.userRoles?.map(({ roleId }) => roleId) || [];
    return acc;
  }, {});

  const isLoading = userTenantRolesQueries.some(query => query.isLoading);

  return {
    userRoles,
    isLoading,
  };
}

export default useUserAffiliationRoles;

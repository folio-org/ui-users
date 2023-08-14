import { useQuery } from 'react-query';

import {
  useNamespace,
  useOkapiKy,
  useStripes,
} from '@folio/stripes/core';

const usePermissionSet = ({ permissionSetId, tenantId }, options = {}) => {
  const stripes = useStripes();
  const defaultTenantId = stripes.okapi?.tenant;

  const ky = useOkapiKy();
  const api = ky.extend({
    hooks: {
      beforeRequest: [(req) => req.headers.set('X-Okapi-Tenant', tenantId || defaultTenantId)],
    },
  });

  const [namespace] = useNamespace({ key: 'get-permission-set' });
  const {
    isLoading,
    data = {},
    refetch,
  } = useQuery(
    [namespace, permissionSetId],
    ({ signal }) => {
      return api.get(
        `perms/permissions/${permissionSetId}`,
        {
          signal,
        },
      ).json();
    },
    {
      enabled: Boolean(permissionSetId),
      ...options,
    },
  );

  return ({
    refetch,
    isLoading,
    permissionSet: data,
  });
};

export default usePermissionSet;

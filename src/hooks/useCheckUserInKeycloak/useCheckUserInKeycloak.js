import { useCallback } from 'react';

import { useOkapiKy } from '@folio/stripes/core';

import { KEYCLOAK_USER_EXISTENCE } from '../../constants';

const useCheckUserInKeycloak = (userId, handleError) => {
  const ky = useOkapiKy();

  const checkUserInKeycloakForTenant = useCallback(async (targetTenantId) => {
    const tenantApi = ky.extend({
      hooks: {
        beforeRequest: [(req) => req.headers.set('X-Okapi-Tenant', targetTenantId)]
      }
    });

    try {
      await tenantApi.get(`users-keycloak/auth-users/${userId}`);
      return KEYCLOAK_USER_EXISTENCE.exist;
    } catch (error) {
      if (error?.response?.status === 404) {
        return KEYCLOAK_USER_EXISTENCE.nonExist;
      }
      handleError?.(error);
      return KEYCLOAK_USER_EXISTENCE.error;
    }
  }, [ky, userId, handleError]);

  return { checkUserInKeycloakForTenant };
};

export default useCheckUserInKeycloak;

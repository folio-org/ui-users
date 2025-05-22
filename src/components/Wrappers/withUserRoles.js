import React, { useEffect, useState } from 'react';

import { useStripes, useOkapiKy, useCallout } from '@folio/stripes/core';
import isEqual from 'lodash/isEqual';
import { useCreateAuthUserKeycloak, useUserAffiliationRoles } from '../../hooks';
import { KEYCLOAK_USER_EXISTANCE } from '../../constants';
import { showErrorCallout } from '../../views/UserEdit/UserEditHelpers';

const withUserRoles = (WrappedComponent) => (props) => {
  const { okapi } = useStripes();
  // eslint-disable-next-line react/prop-types
  const userId = props.match.params.id;
  const initialAssignedRoleIds = useUserAffiliationRoles(userId);
  const [tenantId, setTenantId] = useState(okapi.tenant);
  const [assignedRoleIds, setAssignedRoleIds] = useState({});
  const [isCreateKeycloakUserConfirmationOpen, setIsCreateKeycloakUserConfirmationOpen] = useState(false);
  const callout = useCallout();
  const sendErrorCallout = error => showErrorCallout(error, callout.sendCallout);

  const { mutateAsync: createKeycloakUser } = useCreateAuthUserKeycloak(sendErrorCallout, { tenantId });

  const ky = useOkapiKy();
  const api = ky.extend({
    hooks: {
      beforeRequest: [(req) => req.headers.set('X-Okapi-Tenant', tenantId)]
    }
  });

  const stringifiedInitialAssignedRoleIds = JSON.stringify(initialAssignedRoleIds);

  useEffect(() => {
    setAssignedRoleIds(initialAssignedRoleIds);
    // on each re-render reference to initialAssignedRoleIds are different, so putting initialAssignedRoleIds to deps causes infinite trigger
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stringifiedInitialAssignedRoleIds]);

  const updateUserRoles = async (roleIds) => {
    // to update roles for different tenants, we need to make API requests for each tenant
    const requests = Object.keys(roleIds).map((tenantIdKey) => {
      const putApi = ky.extend({
        hooks: {
          beforeRequest: [(req) => req.headers.set('X-Okapi-Tenant', tenantIdKey)]
        }
      });

      return putApi.put(`roles/users/${userId}`, {
        json: {
          userId,
          roleIds: roleIds[tenantIdKey],
        }
      }).catch(sendErrorCallout);
    });

    await Promise.allSettled(requests);
  };

  const updateKeycloakUser = async (userId, data) => {
    try {
      // use `ky.put` instead of `api.put` because updating current user data requires setting x-okapi-tenant to the current tenant.
      await ky.put(`users-keycloak/users/${userId}`, {
        json: { ...data }
      });
    } catch (error) {
      sendErrorCallout(error);
    }
  };

  const checkUserInKeycloak = async () => {
    try {
      await api.get(`users-keycloak/auth-users/${userId}`);
      return KEYCLOAK_USER_EXISTANCE.exist;
    } catch (error) {
      if (error?.response?.status === 404) {
        return KEYCLOAK_USER_EXISTANCE.nonExist;
      }
      sendErrorCallout(error);
      return KEYCLOAK_USER_EXISTANCE.error;
    }
  };

  const submitCreateKeycloakUser = async () => {
    await createKeycloakUser(userId);
  };

  const handleKeycloakUserExists = async (onFinish, data) => {
    await updateKeycloakUser(userId, data);

    if (!isEqual(assignedRoleIds, initialAssignedRoleIds)) {
      await updateUserRoles(assignedRoleIds);
    }
    onFinish();
  };

  const checkAndHandleKeycloakAuthUser = async (onFinish, data, mutator) => {
    const userKeycloakStatus = await checkUserInKeycloak();
    switch (userKeycloakStatus) {
      case KEYCLOAK_USER_EXISTANCE.exist:
        // Only save changes to mod-users-keycloak.
        await handleKeycloakUserExists(onFinish, data);
        break;
      case KEYCLOAK_USER_EXISTANCE.nonExist:
        // First, save changes to mod-users.
        // If user decides to create a Keycloak user, then changes will be copied over from mod-users to mod-users-keycloak.
        await mutator.selUser.PUT(data);
        setIsCreateKeycloakUserConfirmationOpen(true);
        break;
      default:
        break;
    }
  };

  const confirmCreateKeycloakUser = async (onFinish) => {
    await submitCreateKeycloakUser();
    await updateUserRoles(assignedRoleIds);
    onFinish();
  };

  return <WrappedComponent
    {...props}
    tenantId={tenantId}
    setTenantId={setTenantId}
    assignedRoleIds={assignedRoleIds}
    setAssignedRoleIds={setAssignedRoleIds}
    isCreateKeycloakUserConfirmationOpen={isCreateKeycloakUserConfirmationOpen}
    initialAssignedRoleIds={initialAssignedRoleIds}
    checkAndHandleKeycloakAuthUser={checkAndHandleKeycloakAuthUser}
    confirmCreateKeycloakUser={confirmCreateKeycloakUser}
  />;
};

export default withUserRoles;

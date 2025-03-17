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

  useEffect(() => {
    setAssignedRoleIds(initialAssignedRoleIds);
  }, [JSON.stringify(initialAssignedRoleIds)]);

  const updateUserRoles = async (roleIds) => {
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

  const handleKeycloakUserExists = async (onFinish) => {
    await updateUserRoles(assignedRoleIds);
    onFinish();
  };

  const checkAndHandleKeycloakAuthUser = async (onFinish) => {
    if (isEqual(assignedRoleIds, initialAssignedRoleIds)) {
      onFinish();
      return;
    }
    const userKeycloakStatus = await checkUserInKeycloak();
    switch (userKeycloakStatus) {
      case KEYCLOAK_USER_EXISTANCE.exist:
        await handleKeycloakUserExists(onFinish);
        break;
      case KEYCLOAK_USER_EXISTANCE.nonExist:
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

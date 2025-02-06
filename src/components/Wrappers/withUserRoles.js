import React, { useCallback, useEffect, useState } from 'react';

import { useStripes, useOkapiKy, useCallout } from '@folio/stripes/core';
import isEqual from 'lodash/isEqual';
import { useAllRolesData, useCreateAuthUserKeycloak } from '../../hooks';
import { KEYCLOAK_USER_EXISTANCE } from '../../constants';
import { showErrorCallout } from '../../views/UserEdit/UserEditHelpers';

const withUserRoles = (WrappedComponent) => (props) => {
  const { okapi, config } = useStripes();
  // eslint-disable-next-line react/prop-types
  const userId = props.match.params.id;
  const [tenantId, setTenantId] = useState(okapi.tenant);
  const [tenantsLoaded, setTenantsLoaded] = useState([]);
  const [assignedRoleIds, setAssignedRoleIds] = useState({});
  const [initialAssignedRoleIds, setInitialAssignedRoleIds] = useState({});
  const [isCreateKeycloakUserConfirmationOpen, setIsCreateKeycloakUserConfirmationOpen] = useState(false);
  const callout = useCallout();
  const sendErrorCallout = error => showErrorCallout(error, callout.sendCallout);

  const { mutateAsync: createKeycloakUser } = useCreateAuthUserKeycloak(sendErrorCallout, { tenantId });

  const { isLoading: isAllRolesDataLoading, allRolesMapStructure } = useAllRolesData({ tenantId });

  const searchParams = {
    limit: config.maxUnpagedResourceCount,
    query: `userId==${userId}`,
  };

  const ky = useOkapiKy();
  const api = ky.extend({
    hooks: {
      beforeRequest: [(req) => req.headers.set('X-Okapi-Tenant', tenantId)]
    }
  });

  const setAssignedRoleIdsOnLoad = useCallback((data) => {
    const assignedRoles = data.userRoles.map(({ roleId }) => {
      const foundUserRole = allRolesMapStructure.get(roleId);

      return { name: foundUserRole?.name, id: foundUserRole?.id };
    }).sort((a, b) => a.name.localeCompare(b.name)).map(r => r.id);

    setTenantsLoaded(tenantsLoaded.concat(tenantId));
    setAssignedRoleIds({ ...assignedRoleIds, [tenantId]: assignedRoles });
    setInitialAssignedRoleIds({ ...assignedRoleIds, [tenantId]: assignedRoles });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allRolesMapStructure]);

  useEffect(() => {
    // eslint-disable-next-line react/prop-types
    if (props.stripes.hasInterface('users-keycloak') && !isAllRolesDataLoading && !!userId && !tenantsLoaded.includes(tenantId)) {
      api.get(
        'roles/users', { searchParams },
      )
        .json()
        .then(setAssignedRoleIdsOnLoad)
        // eslint-disable-next-line no-console
        .catch(sendErrorCallout);
    }
  },
  // Adding api, searchParams to deps causes infinite callback call. Listed deps are enough to track changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [userId, isAllRolesDataLoading, setAssignedRoleIdsOnLoad, tenantId]);

  const updateUserRoles = (roleIds) => {
    Object.keys(roleIds).forEach((tenantIdKey) => {
      // Individually override header for each request.
      const putApi = ky.extend({
        hooks: {
          beforeRequest: [(req) => req.headers.set('X-Okapi-Tenant', tenantId)]
        }
      });
      putApi.put(
        `roles/users/${userId}`, {
          json: {
            userId,
            roleIds: roleIds[tenantIdKey],
          }
        },
      ).json()
      // eslint-disable-next-line no-console
        .catch(sendErrorCallout);
    });
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

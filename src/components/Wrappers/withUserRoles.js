import React, { useEffect, useRef, useState } from 'react';
import { useQueryClient } from 'react-query';

import {
  useStripes,
  useOkapiKy,
  useCallout,
  useNamespace,
} from '@folio/stripes/core';
import isEqual from 'lodash/isEqual';
import isEmpty from 'lodash/isEmpty';
import { useUserAffiliationRoles, useCheckUserInKeycloak } from '../../hooks';
import {
  KEYCLOAK_USER_EXISTENCE,
  USER_AFFILIATION_ROLES_CACHE_KEY,
} from '../../constants';
import { showErrorCallout } from '../../views/UserEdit/UserEditHelpers';

const withUserRoles = (WrappedComponent) => (props) => {
  const stripes = useStripes();
  const { okapi } = stripes;
  const [namespace] = useNamespace({ key: USER_AFFILIATION_ROLES_CACHE_KEY });
  const queryClient = useQueryClient();
  // eslint-disable-next-line react/prop-types
  const userId = props.match.params.id;
  const [initialAssignedRoleIds, setInitialAssignedRoleIds] = useState({});
  const [tenantId, setTenantId] = useState(okapi.tenant);
  const { userRoleIds, isLoading: isLoadingAffiliationRoles } = useUserAffiliationRoles(userId, tenantId);
  const [assignedRoleIds, setAssignedRoleIds] = useState({});
  const [isCreateKeycloakUserConfirmationOpen, setIsCreateKeycloakUserConfirmationOpen] = useState(false);
  const [keycloakMissingTenantNames, setKeycloakMissingTenantNames] = useState('');
  const [keycloakMissingTenantCount, setKeycloakMissingTenantCount] = useState(0);
  const tenantsWithoutKeycloakRef = useRef([]);
  const callout = useCallout();
  const sendErrorCallout = error => showErrorCallout(error, callout.sendCallout);

  const ky = useOkapiKy();

  const { checkUserInKeycloakForTenant } = useCheckUserInKeycloak(userId, sendErrorCallout);

  useEffect(() => {
    // No need to set roles if there are empty or loading
    if (!userRoleIds.length) return;

    setInitialAssignedRoleIds(prev => ({
      ...prev,
      [tenantId]: userRoleIds,
    }));


    // Set assigned roles only if they are not set for the tenant yet
    if (isEmpty(assignedRoleIds[tenantId])) {
      setAssignedRoleIds(prev => ({
        ...prev,
        [tenantId]: userRoleIds,
      }));
    }
  // The effect should only re-run when userRoleIds changes, not when tenantId or assignedRoleIds change,
  // ensuring roles are set only when new data is fetched.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRoleIds]);

  const updateUserRoles = async (roleIds) => {
    // to update roles for different tenants, we need to make API requests for each tenant
    const requests = Object.keys(roleIds).map((tenantIdKey) => {
      // No need to make API call if roles didn't change for the tenant
      if (isEqual(roleIds[tenantIdKey], initialAssignedRoleIds[tenantIdKey])) {
        return Promise.resolve();
      }

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
      })
        .then(async () => {
          await queryClient.invalidateQueries({ queryKey: [namespace, userId, tenantIdKey] });
        })
        .catch(sendErrorCallout);
    });

    await Promise.allSettled(requests);
  };

  const updateKeycloakUser = async (userId2, data) => {
    // use `ky.put` instead of `api.put` because updating current user data requires setting x-okapi-tenant to the current tenant.
    // Don't catch an error to prevent navigating away from the page.
    // The error will be caught in the UserEdit component and shown in a callout.
    await ky.put(`users-keycloak/users/${userId2}`, {
      json: { ...data }
    });
  };

  const createKeycloakUserForTenant = async (targetTenantId) => {
    const tenantApi = ky.extend({
      hooks: {
        beforeRequest: [(req) => req.headers.set('X-Okapi-Tenant', targetTenantId)]
      }
    });

    stripes.logger.log('users-keycloak', `creating keycloak record for ${userId} in tenant ${targetTenantId}`);
    await tenantApi.post(`users-keycloak/auth-users/${userId}`);
  };

  const getTenantsWithChangedRoles = () => {
    return Object.keys(assignedRoleIds).filter(
      (tid) => !isEqual(assignedRoleIds[tid], initialAssignedRoleIds[tid])
    );
  };

  // After clicking Save&Close:
  // 1. Check if the user record exists in Keycloak in the current/home tenant → decide save path (mod-users or mod-users-keycloak)
  // 2. Save user data via the correct path
  // 3. For each tenant with role changes, check if the user record exists in Keycloak
  // 4. If any tenants are missing a Keycloak record → show confirmation dialog → on confirm, create Keycloak records for the missing tenants → save roles
  // 5. If none missing → save roles directly
  const checkAndHandleKeycloakAuthUser = async (onFinish, data, mutator) => {
    // 1. Check keycloak in the home tenant to determine the user data save path.
    const homeKeycloakStatus = await checkUserInKeycloakForTenant(okapi.tenant);

    if (homeKeycloakStatus === KEYCLOAK_USER_EXISTENCE.error) return;

    // 2. Save user data via the appropriate path.
    if (homeKeycloakStatus === KEYCLOAK_USER_EXISTENCE.exist) {
      await updateKeycloakUser(userId, data);
    } else {
      await mutator.selUser.PUT(data);
    }

    // 3. Find tenants where roles changed and check keycloak in each.
    const tenantsWithChangedRoles = getTenantsWithChangedRoles();

    if (!tenantsWithChangedRoles.length) {
      await onFinish();
      return;
    }

    // Include home tenant if it doesn't have a keycloak record
    // and has changed roles, since role assignment requires it.
    const tenantKeycloakStatuses = await Promise.all(
      tenantsWithChangedRoles.map(async (tid) => {
        // Reuse the home tenant check result to avoid a duplicate request.
        if (tid === okapi.tenant) return { tid, status: homeKeycloakStatus };

        const status = await checkUserInKeycloakForTenant(tid);
        return { tid, status };
      })
    );

    const missingKeycloakTenants = tenantKeycloakStatuses
      .filter(({ status }) => status === KEYCLOAK_USER_EXISTENCE.nonExist)
      .map(({ tid }) => tid);

    if (tenantKeycloakStatuses.some(({ status }) => status === KEYCLOAK_USER_EXISTENCE.error)) return;

    if (missingKeycloakTenants.length) {
      // 4. Store which tenants need keycloak records and show the confirmation dialog.
      tenantsWithoutKeycloakRef.current = missingKeycloakTenants;

      const userTenants = stripes.user?.user?.tenants || [];
      const names = missingKeycloakTenants
        .map(id => userTenants.find(t => t.id === id)?.name || id)
        .join(', ');
      setKeycloakMissingTenantNames(names);
      setKeycloakMissingTenantCount(missingKeycloakTenants.length);
      setIsCreateKeycloakUserConfirmationOpen(true);
    } else {
      // 5. Save roles directly
      await updateUserRoles(assignedRoleIds);
      await onFinish();
    }
  };

  const confirmCreateKeycloakUser = async (onFinish) => {
    // Create keycloak records for all tenants that need them.
    await Promise.all(
      tenantsWithoutKeycloakRef.current.map((tid) => createKeycloakUserForTenant(tid).catch(sendErrorCallout))
    );

    // Invalidate cached keycloak auth-user checks used in stripes-authorization-components.
    await queryClient.invalidateQueries(['jit-auth-role']);

    await updateUserRoles(assignedRoleIds);
    await onFinish();
  };

  return <WrappedComponent
    {...props}
    tenantId={tenantId}
    setTenantId={setTenantId}
    assignedRoleIds={assignedRoleIds}
    setAssignedRoleIds={setAssignedRoleIds}
    isCreateKeycloakUserConfirmationOpen={isCreateKeycloakUserConfirmationOpen}
    keycloakMissingTenantNames={keycloakMissingTenantNames}
    keycloakMissingTenantCount={keycloakMissingTenantCount}
    initialAssignedRoleIds={initialAssignedRoleIds}
    checkAndHandleKeycloakAuthUser={checkAndHandleKeycloakAuthUser}
    confirmCreateKeycloakUser={confirmCreateKeycloakUser}
    isLoadingAffiliationRoles={isLoadingAffiliationRoles}
    setIsCreateKeycloakUserConfirmationOpen={setIsCreateKeycloakUserConfirmationOpen}
  />;
};

export default withUserRoles;

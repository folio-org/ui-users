import React, { useEffect, useState } from 'react';

import { useStripes, useOkapiKy, useCallout } from '@folio/stripes/core';
import isEqual from 'lodash/isEqual';
import isEmpty from 'lodash/isEmpty';
import { useCreateAuthUserKeycloak, useUserAffiliationRoles } from '../../hooks';
import { KEYCLOAK_USER_EXISTANCE } from '../../constants';
import { showErrorCallout } from '../../views/UserEdit/UserEditHelpers';

const withUserRoles = (WrappedComponent) => (props) => {
  const { okapi } = useStripes();
  // eslint-disable-next-line react/prop-types
  const userId = props.match.params.id;
  const [initialAssignedRoleIds, setInitialAssignedRoleIds] = useState({});
  const [tenantId, setTenantId] = useState(okapi.tenant);
  const { userRoleIds } = useUserAffiliationRoles(userId, tenantId);
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
  // console.log('+++initialAssignedRoles', initialAssignedRoles)

  useEffect(() => {
    // if (!isEmpty(initialAssignedRoleIds)) return;
    // No need to set roles if there are empty or loading
    if (!userRoleIds.length) return;
    console.log('userRoleIds111', userRoleIds)

    setInitialAssignedRoleIds(prev => ({
      ...prev,
      [tenantId]: userRoleIds,
    }));


    // Set assigned roles only if they are not set for the tenant yet
    // if (!(tenantId in assignedRoleIds)) {
    // if (!(tenantId in assignedRoleIds) || isEmpty(assignedRoleIds[tenantId])) {
      setAssignedRoleIds(prev => ({
        ...prev,
        [tenantId]: userRoleIds,
      }));
    // }
    // console.log('__initialAssignedRoles', initialAssignedRoles)
  }, [userRoleIds]);

  useEffect(() => {
    console.log('initialAssignedRoleIds', initialAssignedRoleIds)
  }, [initialAssignedRoleIds]);

  useEffect(() => {
    console.log('assignedRoleIds', assignedRoleIds)
  }, [assignedRoleIds]);

  // const stringifiedInitialAssignedRoleIds = JSON.stringify(initialAssignedRoleIds);

  // useEffect(() => {
  //   setAssignedRoleIds(initialAssignedRoleIds);
  //   // on each re-render reference to initialAssignedRoleIds are different, so putting initialAssignedRoleIds to deps causes infinite trigger
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [stringifiedInitialAssignedRoleIds]);

  const updateUserRoles = async (roleIds) => {
    console.log('roleIds', roleIds)
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
      }).catch(sendErrorCallout);
    });

    await Promise.allSettled(requests);
  };

  const updateKeycloakUser = async (userId2, data) => {
    try {
      // use `ky.put` instead of `api.put` because updating current user data requires setting x-okapi-tenant to the current tenant.
      await ky.put(`users-keycloak/users/${userId2}`, {
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
    console.log('111assignedRoleIds', assignedRoleIds)
    console.log('111initialAssignedRoleIds', initialAssignedRoleIds)

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
        await mutator.selUser.PUT(data);

        // Only prompt and create Keycloak user if assigning roles.
        // If user confirms, then changes will be copied over from mod-users to mod-users-keycloak.
        if (!isEqual(assignedRoleIds, initialAssignedRoleIds)) {
          setIsCreateKeycloakUserConfirmationOpen(true);
        } else {
          onFinish();
        }
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
    setInitialAssignedRoleIds={setInitialAssignedRoleIds}
    checkAndHandleKeycloakAuthUser={checkAndHandleKeycloakAuthUser}
    confirmCreateKeycloakUser={confirmCreateKeycloakUser}
  />;
};

export default withUserRoles;

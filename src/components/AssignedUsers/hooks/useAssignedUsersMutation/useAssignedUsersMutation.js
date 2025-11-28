import { useMutation } from 'react-query';

import {
  useOkapiKy,
  useStripes,
} from '@folio/stripes/core';

import { PERMISSIONS_API } from '../../constants';
import { fetchUsersByUsersIds } from '../utils';

const useAssignedUsersMutation = ({ tenantId, permissionName }, options = {}) => {
  const stripes = useStripes();
  const defaultTenantId = stripes.okapi?.tenant;

  const ky = useOkapiKy();
  const api = ky.extend({
    hooks: {
      beforeRequest: [(req) => req.headers.set('X-Okapi-Tenant', tenantId || defaultTenantId)],
    },
  });

  const assignMutationFn = async (users = []) => {
    const userIds = users.map(({ id }) => id);
    const permissionUsersResponse = await fetchUsersByUsersIds(api, userIds);

    const query = permissionUsersResponse.map(({ id, userId, permissions }) => {
      const body = { json: { permissions: [...new Set([...permissions, permissionName])], userId, id } };

      return api.put(`${PERMISSIONS_API}/${id}`, body);
    });

    const results = await Promise.allSettled(query);
    const successfulUpdates = results.filter(result => result.status === 'fulfilled').length;

    return {
      requested: users.length,
      successful: successfulUpdates,
      failed: users.length - successfulUpdates,
    };
  };

  const removeMutationFn = async (users = []) => {
    const userIds = users.map(({ id }) => id);
    const permissionUsersResponse = await fetchUsersByUsersIds(api, userIds);
    const query = permissionUsersResponse.map(({ id }) => {
      return api.delete(`${PERMISSIONS_API}/${id}/permissions/${permissionName}`);
    });

    const results = await Promise.allSettled(query);
    const successfulUpdates = results.filter(result => result.status === 'fulfilled').length;

    return {
      requested: users.length,
      successful: successfulUpdates,
      failed: users.length - successfulUpdates,
    };
  };

  const {
    mutateAsync: assignUsers,
    isLoading: isAssigning,
  } = useMutation({ mutationFn: assignMutationFn, ...options });

  const {
    mutateAsync: unassignUsers,
    isLoading: isUnassigning,
  } = useMutation({ mutationFn: removeMutationFn, ...options });

  return ({
    isLoading: isAssigning || isUnassigning,
    assignUsers,
    unassignUsers,
  });
};

export default useAssignedUsersMutation;

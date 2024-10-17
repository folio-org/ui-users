import {
  useMutation,
  useQueryClient,
} from 'react-query';

import {
  useOkapiKy,
  useStripes,
} from '@folio/stripes/core';

const useCreateAuthUserKeycloak = (handleError, options = {}) => {
  const { tenantId } = options;

  const stripes = useStripes();
  const ky = useOkapiKy({ tenant: tenantId });
  const queryClient = useQueryClient();
  const { mutateAsync, isLoading } = useMutation({
    mutationFn: (userId) => {
      stripes.logger.log('users-keycloak', `creating keycloak record for ${userId}`);
      return ky.post(`users-keycloak/auth-users/${userId}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(['jit-auth-role']);
    },
    onError: handleError,
  });

  return { mutateAsync, isLoading };
};

export default useCreateAuthUserKeycloak;

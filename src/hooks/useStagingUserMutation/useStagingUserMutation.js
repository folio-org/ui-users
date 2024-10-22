import { useMutation } from 'react-query';

import { useOkapiKy } from '@folio/stripes/core';

import { PATRON_PREREGISTRATIONS_API } from '../../constants';

const useStagingUserMutation = () => {
  const ky = useOkapiKy();

  const {
    mutateAsync: mergeOrCreateUser,
    isLoading,
  } = useMutation({
    mutationFn: ({ user }) => ky.post(`${PATRON_PREREGISTRATIONS_API}/${user.id}/mergeOrCreateUser`).json(),
  });

  return {
    isLoading,
    mergeOrCreateUser,
  };
};

export default useStagingUserMutation;

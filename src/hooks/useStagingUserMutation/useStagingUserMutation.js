import { useMutation } from 'react-query';

import { useOkapiKy } from '@folio/stripes/core';

import { PATRON_PREREGISTRATIONS_API } from '../../constants';

const useStagingUserMutation = () => {
  const ky = useOkapiKy();

  const {
    mutateAsync: mergeOrCreateUser,
    isLoading,
  } = useMutation({
    mutationFn: ({ stagingUserId, userId }) => {
      return ky.put(
        `${PATRON_PREREGISTRATIONS_API}/${stagingUserId}/mergeOrCreateUser`,
        { searchParams: { userId } },
      ).json();
    },
  });

  return {
    isLoading,
    mergeOrCreateUser,
  };
};

export default useStagingUserMutation;

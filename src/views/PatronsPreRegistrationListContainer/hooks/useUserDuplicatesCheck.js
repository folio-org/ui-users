import { useMutation } from 'react-query';

import { useOkapiKy } from '@folio/stripes/core';

import { USERS_API } from '../../../constants';
import { getPatronDuplicatesQuery } from '../../../utils';

const useUserDuplicatesCheck = (options = {}) => {
  const { tenantId } = options;

  const ky = useOkapiKy({ tenant: tenantId });

  const {
    isLoading,
    mutateAsync: checkDuplicates,
  } = useMutation({
    mutationFn: async (user) => {
      const email = user?.contactInfo?.email;

      if (!email) return false;

      const searchParams = {
        query: getPatronDuplicatesQuery({ email }),
        limit: 1,
      };

      const { totalRecords } = await ky.get(USERS_API, { searchParams }).json();

      return totalRecords > 0;
    }
  });

  return {
    checkDuplicates,
    isLoading,
  };
};

export default useUserDuplicatesCheck;

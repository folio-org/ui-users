import { useOkapiKy } from '@folio/stripes/core';

import { USERS_API } from '../../../constants';
import { getPatronDuplicatesQuery } from '../../../utils';

export const useUserDuplicatesCheck = (options = {}) => {
  const { tenantId } = options;

  const ky = useOkapiKy({ tenant: tenantId });

  const checkDuplicates = async (user) => {
    const email = user?.contactInfo?.email;

    if (!email) return false;

    const searchParams = {
      query: getPatronDuplicatesQuery({ email }),
      limit: 1,
    };

    const { users } = await ky.get(USERS_API, { searchParams }).json();

    return users.length > 0;
  };

  return { checkDuplicates };
};

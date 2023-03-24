import { useQuery } from 'react-query';

import {
  useNamespace,
  useOkapiKy,
} from '@folio/stripes/core';

import {
  CONSORTIA_API,
  CONSORTIA_USER_TENANTS_API,
} from '../../constants';

const useUserAffiliations = ({ userId } = {}, options = {}) => {
  const ky = useOkapiKy();
  const [namespace] = useNamespace({ key: 'user-affiliations' });

  const searchParams = { userId };

  const { isLoading, data = {} } = useQuery(
    [namespace, userId],
    async () => {
      const { consortia } = await ky.get(CONSORTIA_API).json();

      if (consortia?.length) {
        const [consortium] = consortia;

        return ky.get(
          `${CONSORTIA_API}/${consortium.id}/${CONSORTIA_USER_TENANTS_API}`,
          { searchParams },
        ).json();
      }

      return Promise.resolve();
    },
    {
      enabled: Boolean(userId),
      ...options,
    },
  );

  return ({
    affiliations: data.userTenants || [],
    totalRecords: data.totalRecords,
    isLoading,
  });
};

export default useUserAffiliations;

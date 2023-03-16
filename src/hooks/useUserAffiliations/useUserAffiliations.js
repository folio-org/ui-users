import { useQuery } from 'react-query';

import {
  useNamespace,
  useOkapiKy,
} from '@folio/stripes/core';

import { CONSORTIA_USER_TENANTS_API } from '../../constants';

const useUserAffiliations = ({ userId } = {}, options = {}) => {
  const ky = useOkapiKy();
  const [namespace] = useNamespace({ key: 'user-affiliations' });

  const searchParams = { userId };

  const { isLoading, data = {} } = useQuery(
    [namespace, userId],
    () => ky.get(CONSORTIA_USER_TENANTS_API, { searchParams }).json(),
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

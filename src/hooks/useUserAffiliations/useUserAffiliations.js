import orderBy from 'lodash/orderBy';
import { useQuery } from 'react-query';

import {
  useNamespace,
  useOkapiKy,
} from '@folio/stripes/core';

import {
  CONSORTIA_API,
  CONSORTIA_USER_TENANTS_API,
  MAX_RECORDS,
} from '../../constants';

import useConsortium from '../useConsortium';

const DEFAULT_DATA = [];

const useUserAffiliations = ({ userId } = {}, options = {}) => {
  const ky = useOkapiKy();
  const [namespace] = useNamespace({ key: 'user-affiliations' });

  const {
    consortium,
    isLoading: isConsortiumLoading,
  } = useConsortium();

  const searchParams = {
    userId,
    limit: MAX_RECORDS,
  };

  const {
    isFetching,
    isLoading: isAffiliationsLoading,
    data = {},
    refetch,
  } = useQuery(
    [namespace, userId, consortium?.id],
    async () => {
      const { userTenants, totalRecords } = await ky.get(
        `${CONSORTIA_API}/${consortium.id}/${CONSORTIA_USER_TENANTS_API}`,
        { searchParams },
      ).json();

      return {
        userTenants: orderBy(userTenants, 'tenantName'),
        totalRecords,
      };
    },
    {
      enabled: Boolean(consortium?.id && userId),
      ...options,
    },
  );

  const isLoading = isAffiliationsLoading || isConsortiumLoading;

  return ({
    affiliations: data.userTenants || DEFAULT_DATA,
    totalRecords: data.totalRecords,
    isFetching,
    isLoading,
    refetch,
  });
};

export default useUserAffiliations;

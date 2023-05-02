import orderBy from 'lodash/orderBy';
import { useQuery } from 'react-query';

import {
  useNamespace,
  useOkapiKy,
  useStripes,
} from '@folio/stripes/core';

import {
  CONSORTIA_API,
  CONSORTIA_USER_TENANTS_API,
  MAX_RECORDS,
} from '../../constants';

const DEFAULT_DATA = [];

const useUserAffiliations = ({ userId } = {}, options = {}) => {
  const ky = useOkapiKy();
  const { consortium } = useStripes();
  const [namespace] = useNamespace({ key: 'user-affiliations' });

  const api = ky.extend({
    hooks: {
      beforeRequest: [
        request => {
          request.headers.set('X-Okapi-Tenant', consortium.centralTenant);
        }
      ]
    },
  });

  const searchParams = {
    userId,
    limit: MAX_RECORDS,
  };

  const enabled = Boolean(
    consortium?.centralTenant
    && consortium?.id
    && userId
  );

  const {
    isFetching,
    isLoading,
    data = {},
    refetch,
  } = useQuery(
    [namespace, userId, consortium?.id],
    async () => {
      const { userTenants, totalRecords } = await api.get(
        `${CONSORTIA_API}/${consortium.id}/${CONSORTIA_USER_TENANTS_API}`,
        { searchParams },
      ).json();

      return {
        userTenants: orderBy(userTenants, 'tenantName'),
        totalRecords,
      };
    },
    {
      enabled,
      ...options,
    },
  );

  return ({
    affiliations: data.userTenants || DEFAULT_DATA,
    totalRecords: data.totalRecords,
    isFetching,
    isLoading,
    refetch,
  });
};

export default useUserAffiliations;

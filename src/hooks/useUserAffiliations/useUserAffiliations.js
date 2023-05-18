import orderBy from 'lodash/orderBy';
import { useQuery } from 'react-query';

import {
  useStripes,
  useNamespace,
  useOkapiKy,
} from '@folio/stripes/core';

import {
  CONSORTIA_API,
  CONSORTIA_USER_TENANTS_API,
  MAX_RECORDS,
  OKAPI_TENANT_HEADER,
} from '../../constants';

const DEFAULT_DATA = [];

const useUserAffiliations = ({ userId } = {}, options = {}) => {
  const stripes = useStripes();
  const ky = useOkapiKy();
  const [namespace] = useNamespace({ key: 'user-affiliations' });

  const consortium = stripes?.user?.user?.consortium;

  const searchParams = {
    userId,
    limit: MAX_RECORDS,
  };

  const enabled = Boolean(
    consortium?.centralTenantId
    && consortium?.id
    && userId,
  );

  const {
    isFetching,
    isLoading: isAffiliationsLoading,
    data = {},
    refetch,
  } = useQuery(
    [namespace, userId, consortium?.id],
    async () => {
      const api = ky.extend({
        hooks: {
          beforeRequest: [
            request => {
              request.headers.set(OKAPI_TENANT_HEADER, consortium.centralTenantId);
            },
          ],
        },
      });

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

  const isLoading = isAffiliationsLoading;

  return ({
    affiliations: data.userTenants || DEFAULT_DATA,
    totalRecords: data.totalRecords,
    isFetching,
    isLoading,
    refetch,
  });
};

export default useUserAffiliations;

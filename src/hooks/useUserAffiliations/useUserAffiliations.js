import {
  flow,
  orderBy,
} from 'lodash/fp';
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
  OKAPI_TENANT_HEADER,
} from '../../constants';

const DEFAULT_DATA = [];

const filterAffiliations = ({ assignedToCurrentUser = true, currentUserTenants = [] }) => (affiliations = []) => {
  if (!assignedToCurrentUser) return affiliations;

  const currentUserTenantsIds = currentUserTenants.map(({ id }) => id);

  return affiliations.filter(({ tenantId }) => currentUserTenantsIds.includes(tenantId));
};

const useUserAffiliations = ({ userId } = {}, options = {}) => {
  const stripes = useStripes();
  const ky = useOkapiKy();
  const [namespace] = useNamespace({ key: 'user-affiliations' });

  const consortium = stripes?.user?.user?.consortium;
  const currentUserTenants = stripes?.user?.user?.tenants;
  const { assignedToCurrentUser, ...queryOptions } = options;

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
    isLoading,
    data = DEFAULT_DATA,
    refetch,
  } = useQuery(
    [namespace, userId, consortium?.id, assignedToCurrentUser],
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
        userTenants: flow(
          filterAffiliations({ assignedToCurrentUser, currentUserTenants }),
          orderBy('userTenants', 'asc'),
        )(userTenants),
        totalRecords,
      };
    },
    {
      enabled,
      ...queryOptions,
    },
  );

  return ({
    affiliations: data.userTenants,
    totalRecords: data.totalRecords,
    isFetching,
    isLoading,
    refetch,
  });
};

export default useUserAffiliations;

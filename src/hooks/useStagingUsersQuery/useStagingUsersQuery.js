import { useQuery } from 'react-query';

import {
  useNamespace,
  useOkapiKy,
  useStripes,
} from '@folio/stripes/core';

import {
  MAX_RECORDS,
  PATRON_PREREGISTRATIONS_API,
} from '../../constants';

const DEFAULT_DATA = [];

const useStagingUsersQuery = (params = {}, options = {}) => {
  const stripes = useStripes();
  const [namespace] = useNamespace('staging-users');

  const {
    limit = stripes?.config?.maxUnpagedResourceCount || MAX_RECORDS,
    offset = 0,
    query = 'cql.allRecords=1',
  } = params;

  const {
    enabled = true,
    tenantId,
    ...queryOptions
  } = options;

  const ky = useOkapiKy({ tenant: tenantId });

  const searchParams = { limit, offset, query };

  const {
    data,
    isFetched,
    isFetching,
    isLoading,
  } = useQuery({
    queryKey: ['staging-users', limit, namespace, tenantId, offset, query],
    queryFn: ({ signal }) => ky.get(PATRON_PREREGISTRATIONS_API, { searchParams, signal }).json(),
    enabled,
    ...queryOptions,
  });

  return {
    isFetched,
    isFetching,
    isLoading,
    totalRecords: data?.totalRecords ?? 0,
    users: data?.staging_users ?? DEFAULT_DATA,
  };
};

export default useStagingUsersQuery;

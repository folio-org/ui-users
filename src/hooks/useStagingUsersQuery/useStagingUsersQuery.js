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
  const [namespace] = useNamespace();

  const searchParams = {
    query,
    limit,
    offset,
  };

  const {
    data,
    isFetching,
    isLoading,
    isFetched,
  } = useQuery({
    queryKey: ['staging-users', namespace, tenantId, query, limit, offset],
    queryFn: ({ signal }) => ky.get(PATRON_PREREGISTRATIONS_API, { searchParams, signal }).json(),
    enabled,
    ...queryOptions,
  });

  return {
    isFetched,
    isFetching,
    isLoading,
    users: data?.staging_users ?? DEFAULT_DATA,
    totalRecords: data?.totalRecords ?? 0,
  };
};

export default useStagingUsersQuery;

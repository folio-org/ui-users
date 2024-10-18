import { useQuery } from 'react-query';

import {
  useNamespace,
  useOkapiKy,
  useStripes,
} from '@folio/stripes/core';

import {
  GROUPS_API,
  MAX_RECORDS,
} from '../../constants';

const DEFAULT_DATA = [];

const usePatronGroups = (options = {}) => {
  const {
    enabled = true,
    tenantId,
    ...queryOptions
  } = options;

  const stripes = useStripes();
  const ky = useOkapiKy({ tenant: tenantId });
  const [namespace] = useNamespace();

  const searchParams = {
    query: 'cql.allRecords=1 sortby group',
    limit: stripes?.config?.maxUnpagedResourceCount || MAX_RECORDS,
  };

  const {
    data,
    isFetching,
    isLoading,
  } = useQuery({
    queryKey: ['patronGroups', namespace, tenantId],
    queryFn: async ({ signal }) => ky.get(GROUPS_API, { searchParams, signal }).json(),
    enabled,
    ...queryOptions,
  });

  return {
    isFetching,
    isLoading,
    patronGroups: data?.usergroups ?? DEFAULT_DATA,
    totalRecords: data?.totalRecords ?? 0,
  };
};

export default usePatronGroups;

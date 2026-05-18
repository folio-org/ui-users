import { useQuery } from 'react-query';

import { useNamespace, useOkapiKy } from '@folio/stripes/core';

import { MAX_RECORDS } from '../../constants';

const DEPARTMENTS_STALE_TIME_MS = 5 * 60 * 1000;

const DEFAULT_DATA = [];

const useDepartmentsQuery = (options = {}) => {
  const { tenantId, ...queryOptions } = options;

  const [namespace] = useNamespace({ key: 'departments' });
  const ky = useOkapiKy({ tenant: tenantId });

  const { data, isLoading, isError } = useQuery(
    [namespace, tenantId],
    () => ky.get('departments', { searchParams: { limit: MAX_RECORDS } }).json(),
    { staleTime: DEPARTMENTS_STALE_TIME_MS, retry: false, ...queryOptions },
  );

  return {
    departments: data?.departments ?? DEFAULT_DATA,
    isLoading,
    isError,
  };
};

export default useDepartmentsQuery;

import { useQuery } from 'react-query';

import { useNamespace, useOkapiKy } from '@folio/stripes/core';

import { MAX_RECORDS } from '../../constants';

const DEPARTMENTS_STALE_TIME_MS = 5 * 60 * 1000;

const DEFAULT_DATA = [];

const useDepartmentsQuery = (tenantId) => {
  const [namespace] = useNamespace({ key: 'departments' });
  const ky = useOkapiKy({ tenant: tenantId });

  const { data, isLoading } = useQuery(
    [namespace, tenantId],
    () => ky.get('departments', { searchParams: { limit: MAX_RECORDS } }).json(),
    { staleTime: DEPARTMENTS_STALE_TIME_MS },
  );

  return {
    departments: data?.departments ?? DEFAULT_DATA,
    isLoading,
  };
};

export default useDepartmentsQuery;

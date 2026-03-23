import { useInfiniteQuery } from 'react-query';
import { useMemo } from 'react';

import {
  useNamespace,
  useOkapiKy,
} from '@folio/stripes/core';

import { getNextPageParam } from './userAuditDataQueryUtils';

const useUserAuditDataQuery = (userId, tenantId) => {
  const ky = useOkapiKy({ tenant: tenantId });
  const [namespace] = useNamespace({ key: 'user-audit-data' });

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: [namespace, userId, tenantId],
    queryFn: ({ pageParam }) => ky.get(`audit-data/user/${userId}`, {
      searchParams: {
        ...(pageParam && { eventTs: pageParam }),
      }
    }).json(),
    getNextPageParam,
    enabled: Boolean(userId),
    keepPreviousData: true,
  });

  const { flattenedData, totalRecords } = useMemo(() => {
    const items = data?.pages?.flatMap(page => page?.userAuditItems || []) || [];
    const total = data?.pages?.[0]?.totalRecords ?? 0;

    return { flattenedData: items, totalRecords: total };
  }, [data]);

  return {
    data: flattenedData,
    totalRecords,
    isLoading,
    isLoadingMore: isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  };
};

export default useUserAuditDataQuery;

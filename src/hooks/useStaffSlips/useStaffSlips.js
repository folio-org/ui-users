import { useNamespace, useOkapiKy } from '@folio/stripes/core';
import { useQuery } from 'react-query';

export const SLIPS_TYPES = {
  DUE_DATE: 'Due date receipt',
};

const useStaffSlips = () => {
  const ky = useOkapiKy();

  const [namespace] = useNamespace();

  const { data, isLoading, isSuccess } = useQuery({
    queryKey: ['staff-slips', namespace],
    queryFn: () => ky('staff-slips-storage/staff-slips').json(),
    cacheTime: Infinity,
    staleTime: Infinity,
  });

  const staffSlips = data?.staffSlips || [];

  return {
    staffSlips,
    isLoading,
    isSuccess
  };
};

export default useStaffSlips;

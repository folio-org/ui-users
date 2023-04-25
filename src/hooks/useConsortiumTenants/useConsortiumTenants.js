import { useQuery } from 'react-query';

import {
  useNamespace,
  useOkapiKy,
} from '@folio/stripes/core';

import {
  CONSORTIA_API,
  CONSORTIA_TENANTS_API,
  MAX_RECORDS,
} from '../../constants';
import useConsortium from '../useConsortium';

const DEFAULT_DATA = [];

const useConsortiumTenants = () => {
  const ky = useOkapiKy();
  const [namespace] = useNamespace({ key: 'consortium-tenants' });

  const {
    consortium,
    isLoading: isConsortiumLoading,
  } = useConsortium();

  const searchParams = {
    limit: MAX_RECORDS,
  };

  const {
    isFetching,
    isLoading: isAffiliationsLoading,
    data = {},
  } = useQuery(
    [namespace, consortium?.id],
    async () => {
      return ky.get(
        `${CONSORTIA_API}/${consortium.id}/${CONSORTIA_TENANTS_API}`,
        { searchParams },
      ).json();
    },
    {
      enabled: Boolean(consortium?.id),
    },
  );

  const isLoading = isAffiliationsLoading || isConsortiumLoading;

  return ({
    tenants: data.tenants || DEFAULT_DATA,
    totalRecords: data.totalRecords,
    isFetching,
    isLoading,
  });
};

export default useConsortiumTenants;

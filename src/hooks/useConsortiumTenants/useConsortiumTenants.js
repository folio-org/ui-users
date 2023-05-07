import { useQuery } from 'react-query';

import {
  useNamespace,
  useOkapiKy,
} from '@folio/stripes/core';

import {
  CONSORTIA_API,
  CONSORTIA_TENANTS_API,
  MAX_RECORDS,
  OKAPI_TENANT_HEADER,
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

  const api = ky.extend({
    hooks: {
      beforeRequest: [
        request => {
          request.headers.set(OKAPI_TENANT_HEADER, consortium.centralTenant);
        },
      ],
    },
  });

  const searchParams = {
    limit: MAX_RECORDS,
  };

  const enabled = Boolean(consortium?.centralTenant && consortium?.id);

  const {
    isFetching,
    isLoading: isAffiliationsLoading,
    data = {},
  } = useQuery(
    [namespace, consortium?.id],
    async () => {
      return api.get(
        `${CONSORTIA_API}/${consortium.id}/${CONSORTIA_TENANTS_API}`,
        { searchParams },
      ).json();
    },
    { enabled },
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

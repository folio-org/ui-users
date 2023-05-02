import { useQuery } from 'react-query';

import {
  useNamespace,
  useOkapiKy,
  useStripes,
} from '@folio/stripes/core';

import {
  CONSORTIA_API,
  CONSORTIA_TENANTS_API,
  MAX_RECORDS,
} from '../../constants';

const DEFAULT_DATA = [];

const useConsortiumTenants = () => {
  const ky = useOkapiKy();
  const { consortium } = useStripes();
  const [namespace] = useNamespace({ key: 'consortium-tenants' });

  const api = ky.extend({
    hooks: {
      beforeRequest: [
        request => {
          request.headers.set('X-Okapi-Tenant', consortium.centralTenant);
        }
      ]
    },
  });

  const searchParams = {
    limit: MAX_RECORDS,
  };

  const enabled = Boolean(consortium?.centralTenant && consortium?.id);

  const {
    isFetching,
    isLoading,
    data = {},
  } = useQuery(
    [namespace, consortium?.id],
    async () => {
      return api.get(
        `${CONSORTIA_API}/${consortium.id}/${CONSORTIA_TENANTS_API}`,
        { searchParams },
      ).json();
    },
    {
      enabled,
    },
  );

  return ({
    tenants: data.tenants || DEFAULT_DATA,
    totalRecords: data.totalRecords,
    isFetching,
    isLoading,
  });
};

export default useConsortiumTenants;

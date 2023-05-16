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
  OKAPI_TENANT_HEADER,
} from '../../constants';

const DEFAULT_DATA = [];

const useConsortiumTenants = () => {
  const stripes = useStripes();
  const ky = useOkapiKy();
  const [namespace] = useNamespace({ key: 'consortium-tenants' });

  const consortium = stripes?.user?.user?.consortium;

  const searchParams = {
    limit: MAX_RECORDS,
  };

  const enabled = Boolean(consortium?.centralTenantId && consortium?.id);

  const {
    isFetching,
    isLoading,
    data = DEFAULT_DATA,
  } = useQuery(
    [namespace, consortium?.id],
    async () => {
      const api = ky.extend({
        hooks: {
          beforeRequest: [
            request => {
              request.headers.set(OKAPI_TENANT_HEADER, consortium.centralTenantId);
            },
          ],
        },
      });

      return api.get(
        `${CONSORTIA_API}/${consortium.id}/${CONSORTIA_TENANTS_API}`,
        { searchParams },
      ).json();
    },
    { enabled },
  );

  return ({
    tenants: data.tenants,
    totalRecords: data.totalRecords,
    isFetching,
    isLoading,
  });
};

export default useConsortiumTenants;

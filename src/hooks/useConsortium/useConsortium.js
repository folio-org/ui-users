import { useQuery } from 'react-query';

import {
  useNamespace,
  useOkapiKy,
  useStripes,
} from '@folio/stripes/core';

import {
  CONFIGURATIONS_ENTRIES_API,
  CONSORTIA_API,
  MAX_RECORDS,
  OKAPI_TENANT_HEADER,
} from '../../constants';

const MODULE_NAME = 'CONSORTIA';
const CONFIG_NAME = 'centralTenantId';

const useConsortium = () => {
  const stripes = useStripes();
  const ky = useOkapiKy();
  const [namespace] = useNamespace({ key: 'consortium' });

  const configsSearchParams = {
    limit: MAX_RECORDS,
    query: `(module=${MODULE_NAME} and configName=${CONFIG_NAME})`,
  };

  const enabled = Boolean(
    stripes.hasInterface('consortia') && stripes.hasPerm('consortia.consortium.collection.get'),
  );

  const { isLoading, data } = useQuery(
    [namespace],
    async () => {
      const { configs } = await ky.get(
        CONFIGURATIONS_ENTRIES_API,
        { searchParams: configsSearchParams },
      ).json();

      const centralTenant = configs[0]?.value;

      if (!centralTenant) return Promise.resolve();

      const api = ky.extend({
        hooks: {
          beforeRequest: [
            request => {
              request.headers.set(OKAPI_TENANT_HEADER, centralTenant);
            },
          ],
        },
      });

      const { consortia } = await api.get(CONSORTIA_API).json();

      if (consortia?.length) {
        const [consortium] = consortia;

        return {
          ...consortium,
          centralTenant,
        };
      }

      return Promise.resolve({ centralTenant });
    },
    { enabled },
  );

  return ({
    consortium: data,
    isLoading,
  });
};

export default useConsortium;

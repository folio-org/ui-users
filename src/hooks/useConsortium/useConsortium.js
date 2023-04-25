import { useQuery } from 'react-query';

import {
  useNamespace,
  useOkapiKy,
  useStripes,
} from '@folio/stripes/core';

import { CONSORTIA_API } from '../../constants';

const useConsortium = () => {
  const stripes = useStripes();
  const ky = useOkapiKy();
  const [namespace] = useNamespace({ key: 'consortium' });

  const enabled = Boolean(
    stripes.hasInterface('consortia') && stripes.hasPerm('consortia.consortium.collection.get')
  );

  const { isLoading, data } = useQuery(
    [namespace],
    async () => {
      const { consortia } = await ky.get(CONSORTIA_API).json();

      if (consortia?.length) {
        const [consortium] = consortia;

        return consortium;
      }

      return Promise.resolve();
    },
    {
      enabled,
    },
  );

  return ({
    consortium: data,
    isLoading,
  });
};

export default useConsortium;

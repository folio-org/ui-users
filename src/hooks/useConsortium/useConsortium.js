import { useQuery } from 'react-query';

import {
  useNamespace,
  useOkapiKy,
} from '@folio/stripes/core';

import { CONSORTIA_API } from '../../constants';

const useConsortium = () => {
  const ky = useOkapiKy();
  const [namespace] = useNamespace({ key: 'consortium' });

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
  );

  return ({
    consortium: data,
    isLoading,
  });
};

export default useConsortium;

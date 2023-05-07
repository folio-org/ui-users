import { renderHook } from '@testing-library/react-hooks';
import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';

import { useOkapiKy } from '@folio/stripes/core';

import consortia from '../../../test/jest/fixtures/consortia';
import {
  CONFIGURATIONS_ENTRIES_API,
  CONSORTIA_API,
} from '../../constants';
import useConsortium from './useConsortium';

const configs = [
  {
    id: '8628171f-292f-44d6-9cd1-1f254786c166',
    module: 'CONSORTIA',
    configName: 'centralTenantId',
    enabled: true,
    value: 'mobius',
  },
];

const queryClient = new QueryClient();

// eslint-disable-next-line react/prop-types
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('useConsortium', () => {
  const mockGet = (data) => jest.fn(() => ({
    json: () => Promise.resolve(data),
  }));

  const getConfigs = mockGet({ configs });
  const getConsortia = mockGet({ consortia });

  const setHeaderMock = jest.fn();
  const kyMock = {
    get: getConfigs,
    extend: jest.fn(({ hooks: { beforeRequest } }) => {
      beforeRequest.forEach(handler => handler({ headers: { set: setHeaderMock } }));

      return {
        get: getConsortia,
      };
    }),
  };

  beforeEach(() => {
    getConfigs.mockClear();
    getConsortia.mockClear();
    useOkapiKy.mockClear().mockReturnValue(kyMock);
  });

  it('should fetch system consortia', async () => {
    const { result, waitFor } = renderHook(() => useConsortium(), { wrapper });

    await waitFor(() => !result.current.isLoading);

    expect(getConfigs).toHaveBeenCalledWith(
      CONFIGURATIONS_ENTRIES_API,
      expect.objectContaining({
        searchParams: expect.objectContaining({
          query: '(module=CONSORTIA and configName=centralTenantId)',
        }),
      }),
    );
    expect(getConsortia).toHaveBeenCalledWith(CONSORTIA_API);
    expect(result.current.consortium).toEqual(expect.objectContaining({
      ...consortia[0],
      centralTenant: configs[0].value,
    }));
  });
});

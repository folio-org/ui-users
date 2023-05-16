import { renderHook } from '@folio/jest-config-stripes/testing-library/react-hooks';
import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';

import { useOkapiKy } from '@folio/stripes/core';

import affiliations from '../../../test/jest/fixtures/affiliations';
import consortia from '../../../test/jest/fixtures/consortia';
import {
  CONSORTIA_API,
  CONSORTIA_TENANTS_API,
  MAX_RECORDS,
} from '../../constants';
import useConsortium from '../useConsortium';
import useConsortiumTenants from './useConsortiumTenants';

jest.mock('@folio/stripes/core', () => ({
  ...jest.requireActual('@folio/stripes/core'),
  useNamespace: jest.fn(() => ['test']),
  useOkapiKy: jest.fn(),
}));
jest.mock('../useConsortium', () => jest.fn());

const queryClient = new QueryClient();

// eslint-disable-next-line react/prop-types
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

const consortium = {
  ...consortia[0],
  centralTenant: 'mobius',
};

const response = {
  tenants: affiliations,
  totalRecords: affiliations.length,
};

describe('useConsortiumTenants', () => {
  const mockGet = jest.fn(() => ({
    json: () => Promise.resolve(response),
  }));
  const setHeaderMock = jest.fn();
  const kyMock = {
    extend: jest.fn(({ hooks: { beforeRequest } }) => {
      beforeRequest.forEach(handler => handler({ headers: { set: setHeaderMock } }));

      return {
        get: mockGet,
      };
    }),
  };

  beforeEach(() => {
    mockGet.mockClear();
    useConsortium.mockClear().mockReturnValue({ consortium });
    useOkapiKy.mockClear().mockReturnValue(kyMock);
  });

  it('should fetch consortium tenants', async () => {
    const { result, waitFor } = renderHook(() => useConsortiumTenants(), { wrapper });

    await waitFor(() => !result.current.isLoading);

    expect(mockGet.mock.calls.length).toBe(1);
    expect(mockGet).toHaveBeenCalledWith(
      `${CONSORTIA_API}/${consortium.id}/${CONSORTIA_TENANTS_API}`,
      expect.objectContaining({ searchParams: { limit: MAX_RECORDS } }),
    );
    expect(result.current.tenants).toEqual(affiliations);
  });
});

import { renderHook, waitFor } from '@folio/jest-config-stripes/testing-library/react';
import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';

import {
  useOkapiKy,
  useStripes,
} from '@folio/stripes/core';

import consortia from '../../../test/jest/fixtures/consortia';
import useConsortiumPermissions from './useConsortiumPermissions';

jest.mock('@folio/stripes/core', () => ({
  ...jest.requireActual('@folio/stripes/core'),
  useNamespace: jest.fn(() => ['test']),
  useOkapiKy: jest.fn(),
  useStripes: jest.fn(),
}));

const queryClient = new QueryClient();

// eslint-disable-next-line react/prop-types
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

const user = { id: 'userId' };
const consortium = {
  ...consortia[0],
  centralTenantId: 'mobius',
};

describe('useConsortiumPermissions with users-keycloak', () => {
  const keycloakResponse = {
    'user': {
      'username': 'circ-admin',
      'id': '7cf60c03-1a83-4d40-9aec-961f2e55963f',
    },
    'permissions': {
      'userId': '7cf60c03-1a83-4d40-9aec-961f2e55963f',
      'permissions': [
        'monkey.bagel',
        'thunder.chicken',
        'consortia.view',
      ]
    }
  };

  const mockGet = jest.fn(() => ({
    json: () => Promise.resolve(keycloakResponse),
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
    useOkapiKy.mockClear().mockReturnValue(kyMock);
    useStripes.mockClear().mockReturnValue({
      hasInterface: () => (true),
      user: {
        user: { ...user, consortium },
      }
    });
  });

  it('should fetch consortium permissions via capabilities interface', async () => {
    const { result } = renderHook(() => useConsortiumPermissions(), { wrapper });

    await waitFor(() => !result.current.isLoading);

    expect(mockGet).toHaveBeenCalledWith('users-keycloak/_self');
  });

  it('should return consortia permissions', async () => {
    const { result } = renderHook(() => useConsortiumPermissions(), { wrapper });

    await waitFor(() => !result.current.isLoading);

    expect(result.current.permissions).toEqual({ 'consortia.view': true });
  });
});

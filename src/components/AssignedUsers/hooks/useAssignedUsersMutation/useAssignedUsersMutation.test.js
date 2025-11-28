import { renderHook } from '@folio/jest-config-stripes/testing-library/react';
import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';

import {
  useOkapiKy,
  useStripes,
} from '@folio/stripes/core';

import useAssignedUsersMutation from './useAssignedUsersMutation';

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

const userRecords = [
  {
    id: '1',
    userId: '1',
    permissions: ['perm1', 'perm2'],
  },
];

describe('useAssignedUsersMutation', () => {
  const tenantId = 'diku';
  const permissionName = 'user.assign-permissions';

  const defaultProps = {
    tenantId,
    permissionName,
  };

  const setHeaderMock = jest.fn();
  const kyMock = jest.fn(() => ({
    extend: jest.fn(({ hooks: { beforeRequest } }) => {
      beforeRequest.forEach(handler => handler({ headers: { set: setHeaderMock } }));

      return {
        delete: jest.fn(() => 'ok'),
        get: () => ({ json: () => Promise.resolve({ permissionUsers: userRecords }) }),
        put: () => ({ json: () => Promise.all(['ok']) }),
      };
    }),
  }));

  beforeEach(() => {
    kyMock.mockClear();
    useStripes.mockClear().mockReturnValue({ okapi: { tenant: tenantId } });
    useOkapiKy.mockImplementation(kyMock);
  });

  it('should have assignUser, unassignUsers mutations', async () => {
    const { result } = renderHook(() => useAssignedUsersMutation(defaultProps, {}), { wrapper });

    expect(result.current).toHaveProperty('assignUsers');
    expect(result.current).toHaveProperty('unassignUsers');
  });

  it('should call assignUser, unassignUsers mutations', async () => {
    const { result } = renderHook(() => useAssignedUsersMutation({ ...defaultProps, tenantId: '' }, {}), { wrapper });

    await result.current.assignUsers(['1', '2']);
    await result.current.unassignUsers(['1']);
  });

  describe('assignUsers', () => {
    it('should return correct stats when all users are successfully assigned', async () => {
      const putMock = jest.fn().mockResolvedValue('ok');
      const kyExtendMock = {
        delete: jest.fn(),
        get: jest.fn(() => ({ json: () => Promise.resolve({ permissionUsers: userRecords }) })),
        put: putMock,
      };

      useOkapiKy.mockImplementation(() => ({
        extend: jest.fn(() => kyExtendMock),
      }));

      const { result } = renderHook(() => useAssignedUsersMutation(defaultProps, {}), { wrapper });
      const users = [{ id: '1' }];
      const response = await result.current.assignUsers(users);

      expect(response).toEqual({
        requested: 1,
        successful: 1,
        failed: 0,
      });
    });

    it('should return correct stats when some users fail to be assigned', async () => {
      const putMock = jest.fn()
        .mockResolvedValueOnce('ok')
        .mockRejectedValueOnce(new Error('API error'));

      const kyExtendMock = {
        delete: jest.fn(),
        get: jest.fn(() => ({
          json: () => Promise.resolve({
            permissionUsers: [
              { id: '1', userId: '1', permissions: ['perm1'] },
              { id: '2', userId: '2', permissions: ['perm2'] },
            ]
          })
        })),
        put: putMock,
      };

      useOkapiKy.mockImplementation(() => ({
        extend: jest.fn(() => kyExtendMock),
      }));

      const { result } = renderHook(() => useAssignedUsersMutation(defaultProps, {}), { wrapper });
      const users = [{ id: '1' }, { id: '2' }];
      const response = await result.current.assignUsers(users);

      expect(response).toEqual({
        requested: 2,
        successful: 1,
        failed: 1,
      });
    });

    it('should return correct stats when users without permission records are requested', async () => {
      const putMock = jest.fn().mockResolvedValue('ok');
      const kyExtendMock = {
        delete: jest.fn(),
        get: jest.fn(() => ({
          json: () => Promise.resolve({
            permissionUsers: [
              { id: '1', userId: '1', permissions: ['perm1'] },
            ]
          })
        })),
        put: putMock,
      };

      useOkapiKy.mockImplementation(() => ({
        extend: jest.fn(() => kyExtendMock),
      }));

      const { result } = renderHook(() => useAssignedUsersMutation(defaultProps, {}), { wrapper });
      const users = [{ id: '1' }, { id: '2' }, { id: '3' }];
      const response = await result.current.assignUsers(users);

      expect(response).toEqual({
        requested: 3,
        successful: 1,
        failed: 2,
      });
    });

    it('should return all failed when no permission records exist', async () => {
      const kyExtendMock = {
        delete: jest.fn(),
        get: jest.fn(() => ({ json: () => Promise.resolve({ permissionUsers: [] }) })),
        put: jest.fn(),
      };

      useOkapiKy.mockImplementation(() => ({
        extend: jest.fn(() => kyExtendMock),
      }));

      const { result } = renderHook(() => useAssignedUsersMutation(defaultProps, {}), { wrapper });
      const users = [{ id: '1' }, { id: '2' }];
      const response = await result.current.assignUsers(users);

      expect(response).toEqual({
        requested: 2,
        successful: 0,
        failed: 2,
      });
    });
  });

  describe('unassignUsers', () => {
    it('should return correct stats when all users are successfully unassigned', async () => {
      const deleteMock = jest.fn().mockResolvedValue('ok');
      const kyExtendMock = {
        delete: deleteMock,
        get: jest.fn(() => ({ json: () => Promise.resolve({ permissionUsers: userRecords }) })),
        put: jest.fn(),
      };

      useOkapiKy.mockImplementation(() => ({
        extend: jest.fn(() => kyExtendMock),
      }));

      const { result } = renderHook(() => useAssignedUsersMutation(defaultProps, {}), { wrapper });
      const users = [{ id: '1' }];
      const response = await result.current.unassignUsers(users);

      expect(response).toEqual({
        requested: 1,
        successful: 1,
        failed: 0,
      });
    });

    it('should return correct stats when some users fail to be unassigned', async () => {
      const deleteMock = jest.fn()
        .mockResolvedValueOnce('ok')
        .mockRejectedValueOnce(new Error('API error'));

      const kyExtendMock = {
        delete: deleteMock,
        get: jest.fn(() => ({
          json: () => Promise.resolve({
            permissionUsers: [
              { id: '1', userId: '1', permissions: ['perm1'] },
              { id: '2', userId: '2', permissions: ['perm2'] },
            ]
          })
        })),
        put: jest.fn(),
      };

      useOkapiKy.mockImplementation(() => ({
        extend: jest.fn(() => kyExtendMock),
      }));

      const { result } = renderHook(() => useAssignedUsersMutation(defaultProps, {}), { wrapper });
      const users = [{ id: '1' }, { id: '2' }];
      const response = await result.current.unassignUsers(users);

      expect(response).toEqual({
        requested: 2,
        successful: 1,
        failed: 1,
      });
    });

    it('should return correct stats when users without permission records are requested', async () => {
      const deleteMock = jest.fn().mockResolvedValue('ok');
      const kyExtendMock = {
        delete: deleteMock,
        get: jest.fn(() => ({
          json: () => Promise.resolve({
            permissionUsers: [
              { id: '1', userId: '1', permissions: ['perm1'] },
            ]
          })
        })),
        put: jest.fn(),
      };

      useOkapiKy.mockImplementation(() => ({
        extend: jest.fn(() => kyExtendMock),
      }));

      const { result } = renderHook(() => useAssignedUsersMutation(defaultProps, {}), { wrapper });
      const users = [{ id: '1' }, { id: '2' }, { id: '3' }];
      const response = await result.current.unassignUsers(users);

      expect(response).toEqual({
        requested: 3,
        successful: 1,
        failed: 2,
      });
    });

    it('should return all failed when no permission records exist', async () => {
      const kyExtendMock = {
        delete: jest.fn(),
        get: jest.fn(() => ({ json: () => Promise.resolve({ permissionUsers: [] }) })),
        put: jest.fn(),
      };

      useOkapiKy.mockImplementation(() => ({
        extend: jest.fn(() => kyExtendMock),
      }));

      const { result } = renderHook(() => useAssignedUsersMutation(defaultProps, {}), { wrapper });
      const users = [{ id: '1' }, { id: '2' }];
      const response = await result.current.unassignUsers(users);

      expect(response).toEqual({
        requested: 2,
        successful: 0,
        failed: 2,
      });
    });
  });
});

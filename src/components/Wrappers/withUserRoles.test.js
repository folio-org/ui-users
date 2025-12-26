import { act } from 'react';

import { cleanup, render, waitFor } from '@folio/jest-config-stripes/testing-library/react';
import { useStripes, useOkapiKy } from '@folio/stripes/core';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';
import withUserRoles from './withUserRoles';
import { useAllRolesData, useUserAffiliationRoles } from '../../hooks';

jest.mock('react-query', () => ({
  useQueryClient: jest.fn(() => ({ invalidateQueries: jest.fn() })),
}));

jest.mock('@folio/stripes/core', () => ({
  useCallout: jest.fn(() => ({ sendCallout: jest.fn() })),
  useNamespace: jest.fn(() => ['test-namespace']),
  useStripes: jest.fn(),
  useOkapiKy: jest.fn(),
}));

jest.mock('../../hooks', () => ({
  useCreateAuthUserKeycloak: jest.fn(() => ({
    mutateAsync: jest.fn()
  })),
  useAllRolesData: jest.fn(),
  useUserAffiliationRoles: jest.fn(),
}));

const mockStripes = {
  okapi: {
    tenant: 'consortium',
  },
  config: {
    maxUnpagedResourceCount: 1000,
  },
  mutator: {
    selUser: {
      PUT: jest.fn().mockResolvedValue({ data: {} }),
    },
  }
};

const mockRolesData = {
  isLoading: false,
  allRolesMapStructure: new Map([
    ['role1', { name: 'Role 1', id: 'role1' }],
    ['role2', { name: 'Role 2', id: 'role2' }],
  ]),
};

const mockUserAffiliationRoles = {
  userRoleIds: ['role1', 'role2'],
  isLoading: false,
};

const mockData = {
  id: 'userId',
  username: 'testUser',
};

const mockApiPut = jest.fn(() => Promise.resolve({
  json: () => Promise.resolve(),
}));

const mockKyPut = jest.fn();

const mockKy = {
  extend: () => ({
    get: jest.fn().mockImplementationOnce(() => ({
      json: () => Promise.resolve({ userRoles: [{ roleId: 'role1' }, { roleId: 'role2' }] }),
    })).mockImplementationOnce(() => Promise.resolve(true)),
    put: mockApiPut,
  }),
  put: mockKyPut,
};

const WrappedComponent = ({ assignedRoleIds,
  setAssignedRoleIds,
  checkAndHandleKeycloakAuthUser, confirmCreateKeycloakUser }) => (
    <div data-testid="assigned-role-ids">{assignedRoleIds.consortium?.join(', ')}
      <button
        type="submit"
        data-testid="submit-form"
        onClick={() => checkAndHandleKeycloakAuthUser(() => {}, mockData)}
      >Submit
      </button>
      <button
        type="button"
        onClick={() => setAssignedRoleIds({
          college: ['collegeRole1'],
          consortium: ['role1', 'role2'],
          university: ['universityRole1'],
        })}
        data-testid="assignRoles"
      >
        Assign roles
      </button>
      <div data-testid="confirmation-dialog">
        <button
          type="button"
          data-testid="confirm-create-keycloak-user"
          onClick={() => confirmCreateKeycloakUser(() => {
          })}
        >Confirm
        </button>
      </div>
    </div>
);

const CompWithUserRoles = withUserRoles(WrappedComponent);

const renderComponent = (props = {}) => render(
  <CompWithUserRoles
    match={{ params: { id: 'user1' } }}
    stripes={mockStripes}
    {...props}
  />
);

describe('withUserRoles HOC', () => {
  afterAll(() => {
    jest.clearAllMocks();
    cleanup();
  });
  beforeEach(() => {
    useStripes.mockReturnValue(mockStripes);
    useAllRolesData.mockReturnValue(mockRolesData);
    useUserAffiliationRoles.mockReturnValue(mockUserAffiliationRoles);
    useOkapiKy.mockReturnValue(mockKy);
  });

  it('fetches and sets assigned role ids on mount and assignedRoleIds passed to wrapped component correctly', async () => {
    const { getByTestId } = renderComponent();

    await waitFor(() => expect(getByTestId('assigned-role-ids')).toHaveTextContent('role1, role2'));
  });

  it('check keycloak user', async () => {
    const { getByTestId } = renderComponent();

    await userEvent.click(getByTestId('submit-form'));
  });

  it('submit form changing user role ids', async () => {
    const { getByTestId } = renderComponent();

    await act(() => userEvent.click(getByTestId('assignRoles')));
    await userEvent.click(getByTestId('submit-form'));
  });

  it('submit form after changing user role ids', async () => {
    const { getByTestId } = renderComponent();

    await act(() => userEvent.click(getByTestId('assignRoles')));
    await userEvent.click(getByTestId('confirm-create-keycloak-user'));
  });

  describe('when assigning roles for other tenants', () => {
    beforeEach(async () => {
      jest.clearAllMocks();

      useUserAffiliationRoles.mockReturnValue({
        userRoleIds: {
          college: [],
          consortium: ['role1', 'role2'],
          university: [],
        },
        isLoading: false,
      });

      const { getByTestId } = renderComponent();

      await act(() => userEvent.click(getByTestId('assignRoles')));
      await act(() => userEvent.click(getByTestId('submit-form')));
    });

    it('should save roles for each tenant', () => {
      expect(mockApiPut).toHaveBeenCalledWith('roles/users/user1', {
        json: {
          userId: 'user1',
          roleIds: ['collegeRole1'],
        },
      });
      expect(mockApiPut).toHaveBeenCalledWith('roles/users/user1', {
        json: {
          userId: 'user1',
          roleIds: ['universityRole1'],
        },
      });
      expect(mockApiPut).toHaveBeenCalledWith('roles/users/user1', {
        json: {
          userId: 'user1',
          roleIds: ['role1', 'role2'],
        },
      });
    });

    it('should save user data for the current tenant using `ky.put` rather than `api.put`', () => {
      expect(mockKyPut).toHaveBeenCalledWith('users-keycloak/users/user1', {
        json: mockData,
      });
    });
  });
});

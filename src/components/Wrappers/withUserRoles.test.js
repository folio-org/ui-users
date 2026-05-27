import { act } from 'react';

import { cleanup, render, waitFor } from '@folio/jest-config-stripes/testing-library/react';
import { useStripes, useOkapiKy, useCallout } from '@folio/stripes/core';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';
import withUserRoles from './withUserRoles';
import {
  useAllRolesData,
  useCreateAuthUserKeycloak,
  useUserAffiliationRoles,
} from '../../hooks';

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

const mockApiPut = jest.fn().mockResolvedValue();
const mockKyPut = jest.fn().mockResolvedValue();

let ky;

const mutator = {
  selUser: {
    PUT: jest.fn().mockResolvedValue({ data: {} }),
  },
};

const WrappedComponent = ({
  assignedRoleIds,
  setAssignedRoleIds,
  checkAndHandleKeycloakAuthUser,
  confirmCreateKeycloakUser,
  setTenantId,
  tenantId,
  isCreateKeycloakUserConfirmationOpen,
}) => (
  <div data-testid="assigned-role-ids">{assignedRoleIds.consortium?.join(', ')}
    <button
      type="submit"
      data-testid="submit-form"
      onClick={() => checkAndHandleKeycloakAuthUser(() => {}, mockData, mutator)}
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
    <button
      type="button"
      onClick={() => setTenantId('college')}
      data-testid="switch-tenant"
    >
      Switch tenant
    </button>
    <div data-testid="selected-tenant">{tenantId}</div>
    <div data-testid="keycloak-confirmation-open">{String(isCreateKeycloakUserConfirmationOpen)}</div>
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
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  beforeEach(() => {
    const roleKy = {
      put: mockApiPut,
    };

    ky = {
      get: jest.fn().mockResolvedValue(true),
      put: mockKyPut,
      extend: jest.fn(() => roleKy),
    };

    useStripes.mockReturnValue(mockStripes);
    useAllRolesData.mockReturnValue(mockRolesData);
    useCreateAuthUserKeycloak.mockReturnValue({
      mutateAsync: jest.fn(),
    });
    useUserAffiliationRoles.mockReturnValue(mockUserAffiliationRoles);
    useOkapiKy.mockReturnValue(ky);
  });

  it('fetches and sets assigned role ids on mount and assignedRoleIds passed to wrapped component correctly', async () => {
    const { getByTestId } = renderComponent();

    await waitFor(() => expect(getByTestId('assigned-role-ids')).toHaveTextContent('role1, role2'));
  });

  it('checks keycloak user with the current okapi client', async () => {
    const { getByTestId } = renderComponent();

    await userEvent.click(getByTestId('submit-form'));

    expect(ky.get).toHaveBeenCalledWith('users-keycloak/auth-users/user1');
  });

  it('submit form changing user role ids', async () => {
    const { getByTestId } = renderComponent();

    await act(() => userEvent.click(getByTestId('assignRoles')));
    await userEvent.click(getByTestId('submit-form'));
  });

  it('submit form after changing user role ids', async () => {
    const mutateAsync = jest.fn().mockResolvedValue(undefined);

    useCreateAuthUserKeycloak.mockReturnValue({ mutateAsync });

    const { getByTestId } = renderComponent();

    await act(() => userEvent.click(getByTestId('assignRoles')));
    await userEvent.click(getByTestId('confirm-create-keycloak-user'));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith('user1');
    });
  });

  it('opens keycloak confirmation for the current tenant after switching affiliation tenant', async () => {
    const notFoundError = { response: { status: 404 } };
    ky.get.mockRejectedValue(notFoundError);

    const { getByTestId } = renderComponent();

    await act(() => userEvent.click(getByTestId('assignRoles')));
    await userEvent.click(getByTestId('switch-tenant'));
    await waitFor(() => expect(getByTestId('selected-tenant')).toHaveTextContent('college'));
    await userEvent.click(getByTestId('submit-form'));

    expect(mutator.selUser.PUT).toHaveBeenCalledWith(mockData);
    expect(getByTestId('keycloak-confirmation-open')).toHaveTextContent('true');
    expect(mockKyPut).not.toHaveBeenCalled();
    expect(useCreateAuthUserKeycloak).toHaveBeenLastCalledWith(expect.any(Function));
  });

  describe('when assigning roles for other tenants', () => {
    beforeEach(async () => {
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

  describe('when updateKeycloakUser fails (ky.put throws)', () => {
    const mockError = new Error('Keycloak update failed');
    const mockSendCallout = jest.fn();
    let capturedError;

    // A dedicated component that captures errors thrown by checkAndHandleKeycloakAuthUser
    const ErrorCapturingComponent = ({ checkAndHandleKeycloakAuthUser }) => (
      <button
        data-testid="submit-keycloak-fail"
        type="button"
        onClick={async () => {
          capturedError = undefined;
          try {
            await checkAndHandleKeycloakAuthUser(() => {}, mockData);
          } catch (e) {
            capturedError = e;
          }
        }}
      >
        Submit
      </button>
    );
    const CompWithRolesErrorCapture = withUserRoles(ErrorCapturingComponent);

    beforeEach(() => {
      capturedError = undefined;

      useCallout.mockReturnValue({ sendCallout: mockSendCallout });
      ky.get.mockResolvedValue(true);
      ky.put.mockRejectedValue(mockError);
    });

    it('should propagate the error to the caller instead of catching it', async () => {
      const { getByTestId } = render(
        <CompWithRolesErrorCapture match={{ params: { id: 'user1' } }} />
      );

      await userEvent.click(getByTestId('submit-keycloak-fail'));

      await waitFor(() => {
        expect(capturedError).toBe(mockError);
      });
    });

    it('should not call sendCallout from within updateKeycloakUser', async () => {
      const { getByTestId } = render(
        <CompWithRolesErrorCapture match={{ params: { id: 'user1' } }} />
      );

      await userEvent.click(getByTestId('submit-keycloak-fail'));

      await waitFor(() => {
        expect(capturedError).toBeDefined();
      });

      expect(mockSendCallout).not.toHaveBeenCalled();
    });
  });
});

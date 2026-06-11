import { act } from 'react';
import { useQueryClient } from 'react-query';

import { render, waitFor } from '@folio/jest-config-stripes/testing-library/react';
import { useStripes, useOkapiKy, useCallout } from '@folio/stripes/core';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';
import withUserRoles from './withUserRoles';
import { useAllRolesData, useUserAffiliationRoles, useCheckUserInKeycloak } from '../../hooks';

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
  useAllRolesData: jest.fn(),
  useUserAffiliationRoles: jest.fn(),
  useCheckUserInKeycloak: jest.fn(),
}));

const mockStripes = {
  okapi: {
    tenant: 'consortium',
  },
  config: {
    maxUnpagedResourceCount: 1000,
  },
  logger: {
    log: jest.fn(),
  },
  user: {
    user: {
      tenants: [
        { id: 'consortium', name: 'Consortium' },
        { id: 'college', name: 'College' },
        { id: 'university', name: 'University' },
        { id: 'school', name: 'School' },
      ],
    },
  },
};

const mockMutator = {
  selUser: {
    PUT: jest.fn().mockResolvedValue({ data: {} }),
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

const mockApiGet = jest.fn().mockResolvedValue();
const mockApiPut = jest.fn(() => Promise.resolve({
  json: () => Promise.resolve(),
}));
const mockApiPost = jest.fn().mockResolvedValue();

const mockKy = {
  extend: jest.fn(() => ({
    get: mockApiGet,
    put: mockApiPut,
    post: mockApiPost,
  })),
  put: jest.fn().mockResolvedValue(),
};

const mockOnFinish = jest.fn().mockResolvedValue();
const mockCheckUserInKeycloakForTenant = jest.fn().mockResolvedValue('exist');
const mockInvalidateQueries = jest.fn().mockResolvedValue();
const mockSendCallout = jest.fn();

const WrappedComponent = ({
  assignedRoleIds,
  setAssignedRoleIds,
  checkAndHandleKeycloakAuthUser,
  confirmCreateKeycloakUser,
  isCreateKeycloakUserConfirmationOpen,
  keycloakMissingTenantNames,
  keycloakMissingTenantCount,
}) => (
  <div data-testid="assigned-role-ids">{assignedRoleIds.consortium?.join(', ')}
    <button
      type="submit"
      data-testid="submit-form"
      onClick={() => checkAndHandleKeycloakAuthUser(mockOnFinish, mockData, mockMutator)}
    >Submit
    </button>
    <button
      data-testid="set-roles-for-college"
      type="button"
      onClick={() => setAssignedRoleIds(prev => ({
        ...prev,
        college: ['collegeRole1', 'collegeRole2'],
      }))}
    >
      Set College Roles
    </button>
    <button
      data-testid="set-roles-for-consortium"
      type="button"
      onClick={() => setAssignedRoleIds(prev => ({
        ...prev,
        consortium: ['consortiumRole1', 'consortiumRole2'],
      }))}
    >
      Set Consortium Roles
    </button>
    <button
      data-testid="set-roles-for-university"
      type="button"
      onClick={() => setAssignedRoleIds(prev => ({
        ...prev,
        university: ['universityRole1', 'universityRole2'],
      }))}
    >
      Set University Roles
    </button>
    <button
      data-testid="set-roles-for-school"
      type="button"
      onClick={() => setAssignedRoleIds(prev => ({
        ...prev,
        school: ['schoolRole1', 'schoolRole2'],
      }))}
    >
      Set School Roles
    </button>
    <div>
      <span data-testid="dialog-open">{String(isCreateKeycloakUserConfirmationOpen)}</span>
      <span data-testid="missing-names">{keycloakMissingTenantNames}</span>
      <span data-testid="missing-count">{keycloakMissingTenantCount}</span>
      <button
        type="button"
        data-testid="confirm-create-keycloak-user"
        onClick={() => confirmCreateKeycloakUser(mockOnFinish)}
      >
        Confirm
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
  beforeEach(() => {
    jest.clearAllMocks();
    useStripes.mockReturnValue(mockStripes);
    useAllRolesData.mockReturnValue(mockRolesData);
    useUserAffiliationRoles.mockReturnValue(mockUserAffiliationRoles);
    useOkapiKy.mockReturnValue(mockKy);
    useCheckUserInKeycloak.mockReturnValue({
      checkUserInKeycloakForTenant: mockCheckUserInKeycloakForTenant,
    });
    useQueryClient.mockReturnValue({
      invalidateQueries: mockInvalidateQueries,
    });
    useCallout.mockReturnValue({ sendCallout: mockSendCallout });
  });

  it('fetches and sets assigned role ids on mount and assignedRoleIds passed to wrapped component correctly', async () => {
    const { getByTestId } = renderComponent();

    await waitFor(() => expect(getByTestId('assigned-role-ids')).toHaveTextContent('role1, role2'));
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

      await act(() => userEvent.click(getByTestId('set-roles-for-college')));
      await act(() => userEvent.click(getByTestId('set-roles-for-university')));
      await act(() => userEvent.click(getByTestId('set-roles-for-consortium')));
      await act(() => userEvent.click(getByTestId('submit-form')));
    });

    it('should save roles for each tenant', () => {
      expect(mockApiPut).toHaveBeenCalledWith('roles/users/user1', {
        json: {
          userId: 'user1',
          roleIds: ['collegeRole1', 'collegeRole2'],
        },
      });
      expect(mockApiPut).toHaveBeenCalledWith('roles/users/user1', {
        json: {
          userId: 'user1',
          roleIds: ['universityRole1', 'universityRole2'],
        },
      });
      expect(mockApiPut).toHaveBeenCalledWith('roles/users/user1', {
        json: {
          userId: 'user1',
          roleIds: ['consortiumRole1', 'consortiumRole2'],
        },
      });
    });

    it('should save user data for the current tenant using `ky.put` rather than `api.put`', () => {
      expect(mockKy.put).toHaveBeenCalledWith('users-keycloak/users/user1', {
        json: mockData,
      });
    });
  });

  describe('when updateKeycloakUser fails (ky.put throws)', () => {
    const mockError = new Error('Keycloak update failed');
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
      useOkapiKy.mockReturnValue({
        ...mockKy,
        put: jest.fn().mockRejectedValue(mockError),
      });
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

  describe('when calling checkAndHandleKeycloakAuthUser', () => {
    it('should check if user exists in keycloak for the home/current tenant', async () => {
      const { getByTestId } = renderComponent();

      await act(() => userEvent.click(getByTestId('submit-form')));

      expect(mockCheckUserInKeycloakForTenant).toHaveBeenCalledWith(mockStripes.okapi.tenant);
    });

    describe('and home tenant has keycloak record', () => {
      it('should save the user data for the HOME! tenant using mod-users-keycloak API', async () => {
        const checkUserInKeycloakForTenant = jest.fn().mockResolvedValueOnce('exist');
        useCheckUserInKeycloak.mockReturnValue({
          checkUserInKeycloakForTenant,
        });

        const { getByTestId } = renderComponent();

        await act(() => userEvent.click(getByTestId('submit-form')));

        expect(checkUserInKeycloakForTenant).toHaveBeenCalledWith('consortium');
        expect(mockKy.put).toHaveBeenCalledWith('users-keycloak/users/user1', {
          json: mockData,
        });
        expect(mockMutator.selUser.PUT).not.toHaveBeenCalled();
      });
    });

    describe('and home tenant has no keycloak record', () => {
      it('should save the user data via mod-users API (selUser.PUT) and not mod-users-keycloak API', async () => {
        useCheckUserInKeycloak.mockReturnValue({
          checkUserInKeycloakForTenant: jest.fn().mockResolvedValueOnce('nonExist'),
        });

        const { getByTestId } = renderComponent();

        await act(() => userEvent.click(getByTestId('submit-form')));

        expect(mockMutator.selUser.PUT).toHaveBeenCalledWith(mockData);
        expect(mockKy.put).not.toHaveBeenCalledWith('users-keycloak/users/user1', expect.anything());
      });
    });

    describe('and no roles have changed', () => {
      it('should call onFinish directly without checking keycloak for non-home tenants or saving roles', async () => {
        const { getByTestId } = renderComponent();

        await act(() => userEvent.click(getByTestId('submit-form')));

        expect(mockCheckUserInKeycloakForTenant).toHaveBeenCalledWith('consortium');
        expect(mockOnFinish).toHaveBeenCalled();
        expect(mockCheckUserInKeycloakForTenant).not.toHaveBeenCalledWith('college');
      });
    });

    describe('and there are roles changes', () => {
      it('should check keycloak record existence for each tenant with changed roles', async () => {
        const { getByTestId } = renderComponent();

        await act(() => userEvent.click(getByTestId('set-roles-for-college')));
        await act(() => userEvent.click(getByTestId('set-roles-for-consortium')));
        await act(() => userEvent.click(getByTestId('set-roles-for-school')));

        await act(() => userEvent.click(getByTestId('submit-form')));

        // Home (consortium) tenant is always checked first to determine the save path,
        expect(mockCheckUserInKeycloakForTenant).toHaveBeenCalledWith('consortium');

        // then only the tenants with changed roles are checked.
        expect(mockCheckUserInKeycloakForTenant).toHaveBeenCalledWith('college');
        expect(mockCheckUserInKeycloakForTenant).not.toHaveBeenCalledWith('university');
        expect(mockCheckUserInKeycloakForTenant).toHaveBeenCalledWith('school');
      });

      describe('and keycloak user does not exist for any tenant with changed roles', () => {
        it('should show confirmation dialog', async () => {
          useCheckUserInKeycloak.mockReturnValue({
            checkUserInKeycloakForTenant: jest.fn()
              .mockResolvedValueOnce('exist') // home tenant has a record
              .mockResolvedValue('nonExist'), // all other tenants with changed roles do not have records
          });

          const { getByTestId } = renderComponent();

          await act(() => userEvent.click(getByTestId('set-roles-for-college')));
          await act(() => userEvent.click(getByTestId('submit-form')));

          expect(getByTestId('dialog-open')).toHaveTextContent('true');
        });

        it('should list the tenant names in the confirmation dialog', async () => {
          useCheckUserInKeycloak.mockReturnValue({
            checkUserInKeycloakForTenant: jest.fn()
              .mockResolvedValueOnce('nonExist') // home/Consortium tenant doesn't have a record
              .mockResolvedValueOnce('exist') // College tenant has a record
              .mockResolvedValueOnce('nonExist') // University tenant doesn't have a record
              .mockResolvedValueOnce('exist'), // School tenant has a record
          });

          const { getByTestId } = renderComponent();

          await act(() => userEvent.click(getByTestId('set-roles-for-consortium')));
          await act(() => userEvent.click(getByTestId('set-roles-for-college')));
          await act(() => userEvent.click(getByTestId('set-roles-for-university')));
          await act(() => userEvent.click(getByTestId('set-roles-for-school')));

          await act(() => userEvent.click(getByTestId('submit-form')));

          expect(getByTestId('missing-names')).toHaveTextContent('Consortium, University');
          expect(getByTestId('missing-count')).toHaveTextContent('2');
        });
      });

      describe('and keycloak user exists for all tenants with changed roles', () => {
        it('should save roles and call onFinish without showing confirmation dialog', async () => {
          const checkUserInKeycloakForTenant = jest.fn().mockResolvedValue('exist');
          useCheckUserInKeycloak.mockReturnValue({
            checkUserInKeycloakForTenant,
          });

          const { getByTestId } = renderComponent();

          await act(() => userEvent.click(getByTestId('set-roles-for-college')));
          await act(() => userEvent.click(getByTestId('set-roles-for-university')));
          await act(() => userEvent.click(getByTestId('submit-form')));

          expect(checkUserInKeycloakForTenant).toHaveBeenCalledWith('college');
          expect(checkUserInKeycloakForTenant).toHaveBeenCalledWith('university');
          expect(mockOnFinish).toHaveBeenCalled();
          expect(getByTestId('dialog-open')).toHaveTextContent('false');
        });
      });

      describe('and there is an error checking keycloak for any tenant', () => {
        it('should not proceed with saving roles', async () => {
          const checkUserInKeycloakForTenant = jest.fn()
            .mockResolvedValueOnce('exist') // home tenant has a record
            .mockResolvedValueOnce('error'); // error occurs for a tenant with changed roles

          useCheckUserInKeycloak.mockReturnValue({
            checkUserInKeycloakForTenant,
          });

          const { getByTestId } = renderComponent();

          await act(() => userEvent.click(getByTestId('set-roles-for-college')));
          await act(() => userEvent.click(getByTestId('submit-form')));

          expect(checkUserInKeycloakForTenant).toHaveBeenCalledWith('college');
          expect(mockApiPut).not.toHaveBeenCalledWith('roles/users/user1', expect.anything());
          expect(mockOnFinish).not.toHaveBeenCalled();
          expect(getByTestId('dialog-open')).toHaveTextContent('false');
        });
      });
    });
  });

  describe('confirmation dialog', () => {
    describe('when confirming creation of keycloak user for tenants missing keycloak records', () => {
      it('should create keycloak users for the missing tenants', async () => {
        useCheckUserInKeycloak.mockReturnValue({
          checkUserInKeycloakForTenant: jest.fn()
            .mockResolvedValueOnce('nonExist') // home/Consortium tenant doesn't have a record
            .mockResolvedValueOnce('exist') // College tenant has a record
            .mockResolvedValueOnce('nonExist') // University tenant doesn't have a record
            .mockResolvedValueOnce('exist'), // School tenant has a record
        });

        const { getByTestId } = renderComponent();

        await act(() => userEvent.click(getByTestId('set-roles-for-consortium')));
        await act(() => userEvent.click(getByTestId('set-roles-for-college')));
        await act(() => userEvent.click(getByTestId('set-roles-for-university')));
        await act(() => userEvent.click(getByTestId('set-roles-for-school')));

        await act(() => userEvent.click(getByTestId('submit-form')));

        expect(getByTestId('dialog-open')).toHaveTextContent('true');

        await act(() => userEvent.click(getByTestId('confirm-create-keycloak-user')));

        expect(mockApiPost).toHaveBeenCalledWith('users-keycloak/auth-users/user1');
        // For consortium and university tenants which are missing keycloak records
        expect(mockApiPost).toHaveBeenCalledTimes(2);
        expect(mockKy.extend).toHaveBeenCalledWith({
          hooks: {
            beforeRequest: [expect.any(Function)],
          },
        });
      });

      it('should invalidate queries', async () => {
        useCheckUserInKeycloak.mockReturnValue({
          checkUserInKeycloakForTenant: jest.fn()
            .mockResolvedValueOnce('nonExist') // home/Consortium tenant doesn't have a record
        });

        const { getByTestId } = renderComponent();

        await act(() => userEvent.click(getByTestId('set-roles-for-consortium')));
        await act(() => userEvent.click(getByTestId('submit-form')));

        expect(getByTestId('dialog-open')).toHaveTextContent('true');

        await act(() => userEvent.click(getByTestId('confirm-create-keycloak-user')));

        expect(mockInvalidateQueries).toHaveBeenCalledWith(['jit-auth-role']);
      });

      it('should update the user roles after creating keycloak users', async () => {
        useCheckUserInKeycloak.mockReturnValue({
          checkUserInKeycloakForTenant: jest.fn()
            .mockResolvedValueOnce('nonExist') // home/Consortium tenant doesn't have a record
            .mockResolvedValueOnce('exist') // College tenant has a record
            .mockResolvedValueOnce('nonExist') // University tenant doesn't have a record
            .mockResolvedValueOnce('exist'), // School tenant has a record
        });

        const { getByTestId } = renderComponent();

        await act(() => userEvent.click(getByTestId('set-roles-for-consortium')));
        await act(() => userEvent.click(getByTestId('set-roles-for-college')));
        await act(() => userEvent.click(getByTestId('set-roles-for-university')));
        await act(() => userEvent.click(getByTestId('set-roles-for-school')));

        await act(() => userEvent.click(getByTestId('submit-form')));

        expect(getByTestId('dialog-open')).toHaveTextContent('true');

        await act(() => userEvent.click(getByTestId('confirm-create-keycloak-user')));

        expect(mockApiPut).toHaveBeenCalledWith('roles/users/user1', expect.anything());
        expect(mockApiPut).toHaveBeenCalledTimes(4);
      });

      it('should call onFinish', async () => {
        useCheckUserInKeycloak.mockReturnValue({
          checkUserInKeycloakForTenant: jest.fn()
            .mockResolvedValueOnce('nonExist') // home/Consortium tenant doesn't have a record
        });

        const { getByTestId } = renderComponent();

        await act(() => userEvent.click(getByTestId('set-roles-for-consortium')));
        await act(() => userEvent.click(getByTestId('submit-form')));

        expect(getByTestId('dialog-open')).toHaveTextContent('true');

        await act(() => userEvent.click(getByTestId('confirm-create-keycloak-user')));

        expect(mockOnFinish).toHaveBeenCalled();
      });

      describe('creation fails for any tenant', () => {
        it('should show error callout and keep dialog open without calling onFinish', async () => {
          const post = jest.fn().mockRejectedValue('Keycloak user creation failed');

          useOkapiKy.mockReturnValue({
            ...mockKy,
            extend: jest.fn(() => ({
              get: mockApiGet,
              put: mockApiPut,
              post,
            })),
          });

          useCheckUserInKeycloak.mockReturnValue({
            checkUserInKeycloakForTenant: jest.fn()
              .mockResolvedValueOnce('nonExist') // home/Consortium tenant doesn't have a record
          });

          const { getByTestId } = renderComponent();

          await act(() => userEvent.click(getByTestId('set-roles-for-consortium')));
          await act(() => userEvent.click(getByTestId('set-roles-for-college')));
          await act(() => userEvent.click(getByTestId('submit-form')));

          expect(getByTestId('dialog-open')).toHaveTextContent('true');

          await act(() => userEvent.click(getByTestId('confirm-create-keycloak-user')));

          expect(mockSendCallout).toHaveBeenCalled();
          expect(getByTestId('dialog-open')).toHaveTextContent('true');
          expect(mockOnFinish).not.toHaveBeenCalled();
          expect(mockApiPut).not.toHaveBeenCalledWith('roles/users/user1', expect.anything());
        });

        it('should invalidate queries for successfully created tenants', async () => {
          const post = jest.fn()
            .mockResolvedValueOnce() // first tenant succeeds
            .mockRejectedValueOnce('Keycloak user creation failed'); // second tenant fails

          useOkapiKy.mockReturnValue({
            ...mockKy,
            extend: jest.fn(() => ({
              get: mockApiGet,
              put: mockApiPut,
              post,
            })),
          });

          useCheckUserInKeycloak.mockReturnValue({
            checkUserInKeycloakForTenant: jest.fn()
              .mockResolvedValueOnce('nonExist') // home/Consortium
              .mockResolvedValueOnce('nonExist'), // College
          });

          const { getByTestId } = renderComponent();

          await act(() => userEvent.click(getByTestId('set-roles-for-consortium')));
          await act(() => userEvent.click(getByTestId('set-roles-for-college')));
          await act(() => userEvent.click(getByTestId('submit-form')));

          await act(() => userEvent.click(getByTestId('confirm-create-keycloak-user')));

          expect(mockInvalidateQueries).toHaveBeenCalledWith(['jit-auth-role']);
          expect(mockOnFinish).not.toHaveBeenCalled();
        });

        it('should only retry failed tenants on subsequent confirm', async () => {
          const post = jest.fn()
            .mockResolvedValueOnce() // first confirm: consortium succeeds
            .mockRejectedValueOnce('fail') // first confirm: college fails
            .mockResolvedValueOnce(); // second confirm: college succeeds

          useOkapiKy.mockReturnValue({
            ...mockKy,
            extend: jest.fn(() => ({
              get: mockApiGet,
              put: mockApiPut,
              post,
            })),
          });

          useCheckUserInKeycloak.mockReturnValue({
            checkUserInKeycloakForTenant: jest.fn()
              .mockResolvedValueOnce('nonExist') // Consortium
              .mockResolvedValueOnce('nonExist'), // College
          });

          const { getByTestId } = renderComponent();

          await act(() => userEvent.click(getByTestId('set-roles-for-consortium')));
          await act(() => userEvent.click(getByTestId('set-roles-for-college')));
          await act(() => userEvent.click(getByTestId('submit-form')));

          // First confirm: consortium succeeds, college fails
          await act(() => userEvent.click(getByTestId('confirm-create-keycloak-user')));

          expect(post).toHaveBeenCalledTimes(2);
          expect(mockOnFinish).not.toHaveBeenCalled();
          expect(getByTestId('dialog-open')).toHaveTextContent('true');

          // Second confirm: only college is retried
          await act(() => userEvent.click(getByTestId('confirm-create-keycloak-user')));

          expect(post).toHaveBeenCalledTimes(3); // 2 from first + 1 retry
          expect(mockOnFinish).toHaveBeenCalled();
        });
      });
    });
  });
});

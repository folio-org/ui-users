import {
  render,
  screen,
  waitFor,
} from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

import AssignedUsersContainer from './AssignedUsersContainer';
import AssignedUsersList from './AssignedUsersList';
import {
  useAssignedUsers,
  useAssignedUsersMutation,
  usePermissionSet,
} from './hooks';
import { getUpdatedUsersList } from './utils';

jest.unmock('@folio/stripes/components');
jest.unmock('@folio/stripes/util');

const mockSendCallout = jest.fn();

jest.mock('@folio/stripes/core', () => ({
  ...jest.requireActual('@folio/stripes/core'),
  useCallout: jest.fn(() => ({
    sendCallout: mockSendCallout,
  })),
  IfPermission: props => <>{props.children}</>,
}));

jest.mock('@folio/stripes/components', () => ({
  ...jest.requireActual('@folio/stripes/components'),
  Loading: jest.fn(() => <div>Loading</div>),
}));

jest.mock('./hooks', () => ({
  useAssignedUsers: jest.fn(),
  useAssignedUsersMutation: jest.fn(),
  usePermissionSet: jest.fn(() => ({
    permissionSet: {},
    isLoading: true,
  })),
}));
jest.mock('./utils', () => ({
  getUpdatedUsersList: jest.fn(),
}));

jest.mock('./AssignUsers', () => jest.fn(({ assignUsers }) => (
  <div>
    <button onClick={assignUsers} type="button">Assign/Unassign</button>
  </div>
)));
jest.mock('./AssignedUsersList', () => jest.fn(() => (
  <div>
    <h2>AssignedUsersList</h2>
  </div>
)));

const mockUsers = [
  {
    fullName: 'John Doe',
    patronGroup: 'Staff',
  },
  {
    fullName: 'James Smith',
    patronGroup: 'Staff',
  },
];
const renderComponent = (props = {}) => render(<AssignedUsersContainer {...props} />);

describe('AssignedUsersContainer', () => {
  const onToggle = jest.fn();
  const props = {
    permissionSet: {
      grantedTo: ['1', '2'],
    },
    expanded: true,
    onToggle,
    permissionSetId: 'permissionSetId',
    tenantId: 'tenantId',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    AssignedUsersList.mockClear();
    usePermissionSet.mockClear().mockReturnValue({
      permissionSet: {
        id: '1',
        name: 'permissionSetName',
        displayName: 'permissionSetDisplayName',
        grantedTo: ['1', '2'],
      },
      isLoading: false,
    });
    useAssignedUsers.mockClear().mockReturnValue({
      users: [],
      isLoading: true,
    });
    useAssignedUsersMutation.mockClear().mockReturnValue({
      assignUsers: jest.fn(),
      unassignUsers: jest.fn(),
      isLoading: false,
    });
    getUpdatedUsersList.mockClear().mockReturnValue({
      added: [],
      removed: [],
    });
  });

  it('should render loading', async () => {
    renderComponent(props);

    expect(screen.getByText('Loading')).toBeInTheDocument();
  });

  it('should render empty list', async () => {
    usePermissionSet.mockClear().mockReturnValue({
      permissionSet: {
        id: '1',
        name: 'permissionSetName',
        displayName: 'permissionSetDisplayName',
        grantedTo: [],
      },
      isLoading: false,
    });
    useAssignedUsers.mockClear().mockReturnValue({
      users: [],
      isLoading: false,
    });
    renderComponent(props);

    await waitFor(() => expect(screen.queryByText('Loading')).toBeNull());
    expect(screen.getByText('AssignedUsersList')).toBeInTheDocument();
  });

  it('should render AssignedUsersList', async () => {
    useAssignedUsers.mockReturnValue({
      users: mockUsers,
      isLoading: false,
    });
    getUpdatedUsersList.mockClear().mockReturnValue({
      added: [{ id: '1' }],
      removed: [],
    });

    renderComponent(props);

    await waitFor(() => expect(screen.queryByText('Loading')).toBeNull());
    expect(screen.getByText('AssignedUsersList')).toBeInTheDocument();
  });

  it('should toggle accordion button', async () => {
    useAssignedUsers.mockReturnValue({
      users: mockUsers,
      isLoading: false,
    });
    getUpdatedUsersList.mockClear().mockReturnValue({
      added: [{ id: '1' }],
      removed: [{ id: '2' }],
    });

    renderComponent({ ...props, expanded: false });

    await waitFor(() => expect(screen.queryByText('Loading')).toBeNull());
    expect(screen.getByText(mockUsers.length)).toBeInTheDocument();

    const accordionButton = screen.getByText('ui-users.permissions.assignedUsers');

    await userEvent.click(accordionButton);

    await waitFor(() => expect(screen.getByText('AssignedUsersList')).toBeInTheDocument());
    expect(onToggle).toHaveBeenCalled();
  });

  describe('callout messages', () => {
    it('should show success message when all users are successfully assigned', async () => {
      const mockRefetch = jest.fn();

      usePermissionSet.mockReturnValue({
        permissionSet: {
          id: '1',
          name: 'permissionSetName',
          grantedTo: ['1', '2'],
        },
        isLoading: false,
        refetch: mockRefetch,
      });
      useAssignedUsersMutation.mockReturnValue({
        assignUsers: jest.fn().mockResolvedValue({
          requested: 2,
          successful: 2,
          failed: 0,
        }),
        unassignUsers: jest.fn().mockResolvedValue({
          requested: 0,
          successful: 0,
          failed: 0,
        }),
        isLoading: false,
      });
      useAssignedUsers.mockReturnValue({
        users: mockUsers,
        isLoading: false,
      });

      getUpdatedUsersList.mockReturnValue({
        added: [{ id: '1' }, { id: '2' }],
        removed: [],
      });

      renderComponent(props);

      await waitFor(() => expect(screen.queryByText('Loading')).toBeNull());

      userEvent.click(screen.getByText('Assign/Unassign'));

      await waitFor(() => {
        expect(mockSendCallout).toHaveBeenCalledWith({
          message: 'ui-users.permissions.assignUsers.actions.message.success',
          type: 'success',
        });
      });
    });

    it('should show failure message when no users could be assigned', async () => {
      const mockRefetch = jest.fn();

      usePermissionSet.mockReturnValue({
        permissionSet: {
          id: '1',
          name: 'permissionSetName',
          grantedTo: ['1', '2'],
        },
        isLoading: false,
        refetch: mockRefetch,
      });
      useAssignedUsersMutation.mockReturnValue({
        assignUsers: jest.fn().mockResolvedValue({
          requested: 3,
          successful: 0,
          failed: 3,
        }),
        unassignUsers: jest.fn(),
        isLoading: false,
      });
      useAssignedUsers.mockReturnValue({
        users: mockUsers,
        isLoading: false,
      });

      getUpdatedUsersList.mockReturnValue({
        added: [{ id: '1' }, { id: '2' }, { id: '3' }],
        removed: [],
      });

      renderComponent(props);

      await waitFor(() => expect(screen.queryByText('Loading')).toBeNull());

      userEvent.click(screen.getByText('Assign/Unassign'));

      await waitFor(() => {
        expect(mockSendCallout).toHaveBeenCalledWith({
          message: 'ui-users.permissions.assignUsers.actions.message.failure',
          type: 'error',
        });
      });
      expect(mockRefetch).not.toHaveBeenCalled();
    });

    it('should show partial failure message when some users could not be assigned', async () => {
      const mockRefetch = jest.fn();

      usePermissionSet.mockReturnValue({
        permissionSet: {
          id: '1',
          name: 'permissionSetName',
          grantedTo: ['1', '2'],
        },
        isLoading: false,
        refetch: mockRefetch,
      });
      useAssignedUsersMutation.mockReturnValue({
        assignUsers: jest.fn().mockResolvedValue({
          requested: 5,
          successful: 2,
          failed: 3,
        }),
        unassignUsers: jest.fn(),
        isLoading: false,
      });
      useAssignedUsers.mockReturnValue({
        users: mockUsers,
        isLoading: false,
      });

      getUpdatedUsersList.mockReturnValue({
        added: [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }, { id: '5' }],
        removed: [],
      });

      renderComponent(props);

      await waitFor(() => expect(screen.queryByText('Loading')).toBeNull());

      userEvent.click(screen.getByText('Assign/Unassign'));

      await waitFor(() => {
        expect(mockSendCallout).toHaveBeenCalledWith({
          message: 'ui-users.permissions.assignUsers.actions.message.partialFailure',
          type: 'error',
        });
      });
      expect(mockRefetch).toHaveBeenCalled();
    });

    it('should show success message when all users are successfully unassigned', async () => {
      const mockRefetch = jest.fn();

      usePermissionSet.mockReturnValue({
        permissionSet: {
          id: '1',
          name: 'permissionSetName',
          grantedTo: ['1', '2'],
        },
        isLoading: false,
        refetch: mockRefetch,
      });
      useAssignedUsersMutation.mockReturnValue({
        assignUsers: jest.fn(),
        unassignUsers: jest.fn().mockResolvedValue({
          requested: 2,
          successful: 2,
          failed: 0,
        }),
        isLoading: false,
      });
      useAssignedUsers.mockReturnValue({
        users: mockUsers,
        isLoading: false,
      });

      getUpdatedUsersList.mockReturnValue({
        added: [],
        removed: [{ id: '1' }, { id: '2' }],
      });

      renderComponent(props);

      await waitFor(() => expect(screen.queryByText('Loading')).toBeNull());

      userEvent.click(screen.getByText('Assign/Unassign'));

      await waitFor(() => {
        expect(mockSendCallout).toHaveBeenCalledWith({
          message: 'ui-users.permissions.assignUsers.actions.message.success',
          type: 'success',
        });
      });
    });

    it('should aggregate results from both assign and unassign operations', async () => {
      const mockRefetch = jest.fn();

      usePermissionSet.mockReturnValue({
        permissionSet: {
          id: '1',
          name: 'permissionSetName',
          grantedTo: ['1', '2'],
        },
        isLoading: false,
        refetch: mockRefetch,
      });
      useAssignedUsersMutation.mockReturnValue({
        assignUsers: jest.fn().mockResolvedValue({
          requested: 2,
          successful: 1,
          failed: 1,
        }),
        unassignUsers: jest.fn().mockResolvedValue({
          requested: 2,
          successful: 1,
          failed: 1,
        }),
        isLoading: false,
      });
      useAssignedUsers.mockReturnValue({
        users: mockUsers,
        isLoading: false,
      });

      getUpdatedUsersList.mockReturnValue({
        added: [{ id: '1' }, { id: '2' }],
        removed: [{ id: '3' }, { id: '4' }],
      });

      renderComponent(props);

      await waitFor(() => expect(screen.queryByText('Loading')).toBeNull());

      userEvent.click(screen.getByText('Assign/Unassign'));

      await waitFor(() => {
        expect(mockSendCallout).toHaveBeenCalledWith({
          message: 'ui-users.permissions.assignUsers.actions.message.partialFailure',
          type: 'error',
        });
      });
      expect(mockRefetch).toHaveBeenCalled();
    });

    it('should handle catastrophic errors gracefully', async () => {
      const mockRefetch = jest.fn();
      const mockError = { response: { text: () => Promise.resolve('Network error'), status: 500 }, message: 'Error' };

      usePermissionSet.mockReturnValue({
        permissionSet: {
          id: '1',
          name: 'permissionSetName',
          grantedTo: ['1', '2'],
        },
        isLoading: false,
        refetch: mockRefetch,
      });
      useAssignedUsersMutation.mockReturnValue({
        assignUsers: jest.fn().mockRejectedValue(mockError),
        unassignUsers: jest.fn(),
        isLoading: false,
      });
      useAssignedUsers.mockReturnValue({
        users: mockUsers,
        isLoading: false,
      });

      getUpdatedUsersList.mockReturnValue({
        added: [{ id: '1' }],
        removed: [],
      });

      renderComponent(props);

      await waitFor(() => expect(screen.queryByText('Loading')).toBeNull());

      userEvent.click(screen.getByText('Assign/Unassign'));

      await waitFor(() => {
        expect(mockSendCallout).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'error',
            timeout: 0,
          })
        );
      });
      expect(mockRefetch).not.toHaveBeenCalled();
    });
  });
});

describe('handle mutations', () => {
  const onToggle = jest.fn();
  const props = {
    permissionSet: {
      grantedTo: ['1', '2'],
    },
    expanded: true,
    onToggle,
    permissionSetId: 'permissionSetId',
    tenantId: 'tenantId',
  };

  const testCases = [
    ['added', { added: [{ id: '1' }], removed: [] }],
    ['removed', { added: [], removed: [{ id: '2' }] }],
    ['added and removed', { added: [{ id: '1' }], removed: [{ id: '2' }] }],
    ['no changes', { added: [], removed: [] }],
  ];

  it.each(testCases)('handles %s case', async (scenario, input) => {
    const mockAssignUsers = jest.fn();
    const mockRefetch = jest.fn();

    const mockAssignUsersResult = {
      requested: input.added.length,
      successful: input.added.length,
      failed: 0,
    };

    const mockUnassignUsersResult = {
      requested: input.removed.length,
      successful: input.removed.length,
      failed: 0,
    };

    usePermissionSet.mockClear().mockReturnValue({
      permissionSet: {
        id: '1',
        name: 'permissionSetName',
        grantedTo: ['1', '2'],
      },
      isLoading: false,
      refetch: mockRefetch,
    });
    useAssignedUsersMutation.mockClear().mockReturnValue({
      assignUsers: jest.fn().mockResolvedValue(mockAssignUsersResult),
      unassignUsers: jest.fn().mockResolvedValue(mockUnassignUsersResult),
      isLoading: false,
    });
    useAssignedUsers.mockReturnValue({
      users: mockUsers,
      isLoading: false,
    });

    getUpdatedUsersList.mockClear().mockReturnValue(input);

    const renderComponentWithAssignUsers = (containerProps = {}, assignUsersProps = {}) => render(
      <AssignedUsersContainer {...containerProps}>
        <AssignedUsersList {...assignUsersProps} />
      </AssignedUsersContainer>,
    );

    renderComponentWithAssignUsers(props, { users: mockUsers, assignUsers: mockAssignUsers });

    await waitFor(() => expect(screen.queryByText('Loading')).toBeNull());
    expect(screen.getByText('AssignedUsersList')).toBeInTheDocument();

    userEvent.click(screen.getByText('Assign/Unassign'));
    await waitFor(() => expect(mockRefetch).toBeCalledTimes(scenario === 'no changes' ? 0 : 1));
  });
});

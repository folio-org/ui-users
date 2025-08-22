import {
  render,
  screen,
  waitFor,
} from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

import AssignedUsersContainer from './AssignedUsersContainer';
import {
  useAssignedUsers,
  useAssignedUsersMutation,
  usePermissionSet,
} from './hooks';
import { getUpdatedUsersList } from './utils';

const onToggle = jest.fn();
const mockSendCallout = jest.fn();
const mockRefetch = jest.fn();
const mockAssignUsers = jest.fn();
const mockUnassignUsers = jest.fn();

jest.unmock('@folio/stripes/components');
jest.unmock('@folio/stripes/util');

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
    usePermissionSet.mockReturnValue({
      permissionSet: {
        id: '1',
        name: 'permissionSetName',
        displayName: 'permissionSetDisplayName',
        grantedTo: ['1', '2'],
      },
      isLoading: false,
      refetch: mockRefetch,
    });
    useAssignedUsers.mockReturnValue({
      users: mockUsers,
      isLoading: false,
    });
    useAssignedUsersMutation.mockReturnValue({
      assignUsers: mockAssignUsers,
      unassignUsers: mockUnassignUsers,
      isLoading: false,
    });
    getUpdatedUsersList.mockReturnValue({
      added: [],
      removed: [],
    });
  });

  it('should render loading', async () => {
    useAssignedUsers.mockReturnValue({
      users: [],
      isLoading: true,
    });

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

    expect(screen.queryByText('Loading')).toBeNull();
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

    expect(screen.queryByText('Loading')).toBeNull();
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

    expect(screen.queryByText('Loading')).toBeNull();
    expect(screen.getByText(mockUsers.length)).toBeInTheDocument();

    const accordionButton = screen.getByText('ui-users.permissions.assignedUsers');

    await userEvent.click(accordionButton);

    await waitFor(() => expect(screen.getByText('AssignedUsersList')).toBeInTheDocument());
    expect(onToggle).toHaveBeenCalled();
  });

  describe('handle mutations', () => {
    const props = {
      permissionSet: {
        grantedTo: ['1', '2'],
      },
      expanded: true,
      onToggle,
      permissionSetId: 'permissionSetId',
      tenantId: 'tenantId',
    };

    describe('successful operations', () => {
      it('should handle successful user assignment', async () => {
        const addedUsers = [{ id: '3', name: 'New User' }];
        const assignedUsersResponse = [{ id: '3', userId: '3', permissions: [] }];

        getUpdatedUsersList.mockReturnValue({
          added: addedUsers,
          removed: [],
        });

        mockAssignUsers.mockResolvedValue(assignedUsersResponse);

        renderComponent(props);

        expect(screen.queryByText('Loading')).toBeNull();

        const assignButton = screen.getByText('Assign/Unassign');
        await userEvent.click(assignButton);

        expect(mockAssignUsers).toHaveBeenCalledWith(addedUsers);
        expect(mockRefetch).toHaveBeenCalled();
        expect(mockSendCallout).toHaveBeenCalledWith({
          message: expect.objectContaining({
            props: { id: 'ui-users.permissions.assignUsers.actions.message.success' }
          }),
          type: 'success',
        });
      });

      it('should handle successful user removal', async () => {
        const removedUsers = [{ id: '1', name: 'Remove User' }];

        getUpdatedUsersList.mockReturnValue({
          added: [],
          removed: removedUsers,
        });

        mockUnassignUsers.mockResolvedValue();

        renderComponent(props);

        expect(screen.queryByText('Loading')).toBeNull();

        const assignButton = screen.getByText('Assign/Unassign');
        await userEvent.click(assignButton);

        expect(mockUnassignUsers).toHaveBeenCalledWith(removedUsers);
        expect(mockRefetch).toHaveBeenCalled();
        expect(mockSendCallout).toHaveBeenCalledWith({
          message: expect.objectContaining({
            props: { id: 'ui-users.permissions.assignUsers.actions.message.success' }
          }),
          type: 'success',
        });
      });

      it('should handle successful mixed operations (add and remove)', async () => {
        const addedUsers = [{ id: '3', name: 'New User' }];
        const removedUsers = [{ id: '1', name: 'Remove User' }];
        const assignedUsersResponse = [{ id: '3', userId: '3', permissions: [] }];

        getUpdatedUsersList.mockReturnValue({
          added: addedUsers,
          removed: removedUsers,
        });

        mockAssignUsers.mockResolvedValue(assignedUsersResponse);
        mockUnassignUsers.mockResolvedValue();

        renderComponent(props);

        expect(screen.queryByText('Loading')).toBeNull();

        const assignButton = screen.getByText('Assign/Unassign');
        await userEvent.click(assignButton);

        expect(mockAssignUsers).toHaveBeenCalledWith(addedUsers);
        expect(mockUnassignUsers).toHaveBeenCalledWith(removedUsers);
        expect(mockRefetch).toHaveBeenCalled();
        expect(mockSendCallout).toHaveBeenCalledWith({
          message: expect.objectContaining({
            props: { id: 'ui-users.permissions.assignUsers.actions.message.success' }
          }),
          type: 'success',
        });
      });

      it('should not call refetch when no changes are made', async () => {
        getUpdatedUsersList.mockReturnValue({
          added: [],
          removed: [],
        });

        renderComponent(props);

        expect(screen.queryByText('Loading')).toBeNull();

        const assignButton = screen.getByText('Assign/Unassign');
        await userEvent.click(assignButton);

        expect(mockAssignUsers).not.toHaveBeenCalled();
        expect(mockUnassignUsers).not.toHaveBeenCalled();
        expect(mockRefetch).not.toHaveBeenCalled();
        expect(mockSendCallout).not.toHaveBeenCalled();
      });
    });

    describe('error handling', () => {
      it('should handle assign users error', async () => {
        const addedUsers = [{ id: '3', name: 'New User' }];
        const errorResponse = {
          response: {
            text: jest.fn().mockResolvedValue('Assignment failed'),
            status: 500,
          },
          message: 'Network error',
        };

        getUpdatedUsersList.mockReturnValue({
          added: addedUsers,
          removed: [],
        });

        mockAssignUsers.mockRejectedValue(errorResponse);

        renderComponent(props);

        expect(screen.queryByText('Loading')).toBeNull();

        const assignButton = screen.getByText('Assign/Unassign');
        await userEvent.click(assignButton);

        expect(mockAssignUsers).toHaveBeenCalledWith(addedUsers);
        expect(mockRefetch).not.toHaveBeenCalled();
        expect(mockSendCallout).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'error',
            timeout: 0,
          })
        );
      });

      it('should handle unassign users error', async () => {
        const removedUsers = [{ id: '1', name: 'Remove User' }];
        const errorResponse = {
          response: {
            text: jest.fn().mockResolvedValue('Removal failed'),
            status: 403,
          },
          message: 'Permission denied',
        };

        getUpdatedUsersList.mockReturnValue({
          added: [],
          removed: removedUsers,
        });

        mockUnassignUsers.mockRejectedValue(errorResponse);

        renderComponent(props);

        expect(screen.queryByText('Loading')).toBeNull();

        const assignButton = screen.getByText('Assign/Unassign');
        await userEvent.click(assignButton);

        expect(mockUnassignUsers).toHaveBeenCalledWith(removedUsers);
        expect(mockRefetch).toHaveBeenCalled();
        expect(mockSendCallout).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'error',
            timeout: 0,
          })
        );
      });

      it('should handle permission error (403) with specific message', async () => {
        const addedUsers = [{ id: '3', name: 'New User' }];
        const errorResponse = {
          response: {
            text: jest.fn().mockResolvedValue('Forbidden'),
            status: 403,
          },
          message: 'Permission denied',
        };

        getUpdatedUsersList.mockReturnValue({
          added: addedUsers,
          removed: [],
        });

        mockAssignUsers.mockRejectedValue(errorResponse);

        renderComponent(props);

        expect(screen.queryByText('Loading')).toBeNull();

        const assignButton = screen.getByText('Assign/Unassign');
        await userEvent.click(assignButton);

        expect(mockSendCallout).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'error',
            timeout: 0,
          })
        );
      });
    });

    describe('partial success scenarios', () => {
      it('should handle when no users are assigned (complete failure)', async () => {
        const addedUsers = [{ id: '3', name: 'New User' }, { id: '4', name: 'Another User' }];

        getUpdatedUsersList.mockReturnValue({
          added: addedUsers,
          removed: [],
        });

        mockAssignUsers.mockResolvedValue([]);

        renderComponent(props);

        expect(screen.queryByText('Loading')).toBeNull();

        const assignButton = screen.getByText('Assign/Unassign');
        await userEvent.click(assignButton);

        expect(mockAssignUsers).toHaveBeenCalledWith(addedUsers);
        expect(mockRefetch).toHaveBeenCalled();
        expect(mockSendCallout).toHaveBeenCalledWith({
          message: expect.objectContaining({
            props: { id: 'ui-users.permissions.assignUsers.actions.message.error.all' }
          }),
          type: 'error',
        });
      });

      it('should handle when some users are assigned (partial success)', async () => {
        const addedUsers = [{ id: '3', name: 'New User' }, { id: '4', name: 'Another User' }];
        const partialAssignedUsers = [{ id: '3', userId: '3', permissions: [] }];

        getUpdatedUsersList.mockReturnValue({
          added: addedUsers,
          removed: [],
        });

        mockAssignUsers.mockResolvedValue(partialAssignedUsers);

        renderComponent(props);

        expect(screen.queryByText('Loading')).toBeNull();

        const assignButton = screen.getByText('Assign/Unassign');
        await userEvent.click(assignButton);

        expect(mockAssignUsers).toHaveBeenCalledWith(addedUsers);
        expect(mockRefetch).toHaveBeenCalled();
        expect(mockSendCallout).toHaveBeenCalledWith({
          message: expect.objectContaining({
            props: { id: 'ui-users.permissions.assignUsers.actions.message.error.some' }
          }),
          type: 'error',
        });
      });

      it('should handle error in assignment after successful removal', async () => {
        const addedUsers = [{ id: '3', name: 'New User' }];
        const removedUsers = [{ id: '1', name: 'Remove User' }];
        const errorResponse = {
          response: {
            text: jest.fn().mockResolvedValue('Assignment failed'),
            status: 500,
          },
          message: 'Network error',
        };

        getUpdatedUsersList.mockReturnValue({
          added: addedUsers,
          removed: removedUsers,
        });

        mockUnassignUsers.mockResolvedValue();
        mockAssignUsers.mockRejectedValue(errorResponse);

        renderComponent(props);

        expect(screen.queryByText('Loading')).toBeNull();

        const assignButton = screen.getByText('Assign/Unassign');
        await userEvent.click(assignButton);

        expect(mockAssignUsers).toHaveBeenCalledWith(addedUsers);
        expect(mockUnassignUsers).not.toHaveBeenCalled();
        expect(mockRefetch).not.toHaveBeenCalled();
        expect(mockSendCallout).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'error',
            timeout: 0,
          })
        );
      });

      it('should handle error in removal before assignment', async () => {
        const addedUsers = [{ id: '3', name: 'New User' }];
        const removedUsers = [{ id: '1', name: 'Remove User' }];
        const assignedUsersResponse = [{ id: '3', userId: '3', permissions: [] }];
        const errorResponse = {
          response: {
            text: jest.fn().mockResolvedValue('Removal failed'),
            status: 500,
          },
          message: 'Network error',
        };

        getUpdatedUsersList.mockReturnValue({
          added: addedUsers,
          removed: removedUsers,
        });

        mockAssignUsers.mockResolvedValue(assignedUsersResponse);
        mockUnassignUsers.mockRejectedValue(errorResponse);

        renderComponent(props);

        expect(screen.queryByText('Loading')).toBeNull();

        const assignButton = screen.getByText('Assign/Unassign');
        await userEvent.click(assignButton);

        expect(mockAssignUsers).toHaveBeenCalledWith(addedUsers);
        expect(mockUnassignUsers).toHaveBeenCalledWith(removedUsers);
        expect(mockRefetch).toHaveBeenCalled();
        expect(mockSendCallout).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'error',
            timeout: 0,
          })
        );
      });
    });
  });
});

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

jest.mock('@folio/stripes/core', () => ({
  ...jest.requireActual('@folio/stripes/core'),
  useCallout: jest.fn(() => ({
    sendCallout: jest.fn(),
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
      assignUsers: jest.fn(),
      unassignUsers: jest.fn(),
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

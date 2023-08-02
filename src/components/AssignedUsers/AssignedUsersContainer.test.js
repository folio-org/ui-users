import React from 'react';
import {
  render,
  screen,
  waitFor
} from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

import AssignedUsersContainer from './AssignedUsersContainer';
import AssignedUsersList from './AssignedUsersList';
import {
  useAssignedUsers,
  useAssignedUsersMutation
} from './hooks';
import { findObjectDifferences } from './utils';

jest.unmock('@folio/stripes/components');
jest.unmock('@folio/stripes/util');

jest.mock('@folio/stripes/components', () => ({
  ...jest.requireActual('@folio/stripes/components'),
  Loading: jest.fn(() => <div>Loading</div>),
}));

jest.mock('./hooks', () => ({
  useAssignedUsers: jest.fn(),
  useAssignedUsersMutation: jest.fn(),
}));
jest.mock('./utils', () => ({
  findObjectDifferences: jest.fn(),
}));
jest.mock('./AssignedUsersList', () => jest.fn(({ assignUsers }) => (
  <div>
    <button onClick={assignUsers} type="button">Assign/Unassign</button>
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
    useAssignedUsers.mockClear().mockReturnValue({
      users: [],
      isLoading: true,
    });
    useAssignedUsersMutation.mockClear().mockReturnValue({
      assignUsers: jest.fn(),
      unassignUsers: jest.fn(),
    });
    findObjectDifferences.mockClear().mockReturnValue({
      added: [],
      removed: [],
    });
  });

  it('should render loading', async () => {
    renderComponent(props);

    expect(screen.getByText('Loading')).toBeInTheDocument();
  });

  it('should render AssignedUsersList', async () => {
    useAssignedUsers.mockReturnValue({
      users: mockUsers,
      isLoading: false,
    });
    findObjectDifferences.mockClear().mockReturnValue({
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
    findObjectDifferences.mockClear().mockReturnValue({
      added: [{ id: '1' }],
      removed: [{ id: '2' }],
    });

    renderComponent({ ...props, expanded: false });

    await waitFor(() => expect(screen.queryByText('Loading')).toBeNull());
    expect(screen.getByText(mockUsers.length)).toBeInTheDocument();

    const accordionButton = screen.getByText('ui-users.permissions.assignedUsers');
    userEvent.click(accordionButton);

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

  it('should call assignUsers and unassignUsers mutations', async () => {
    const mockAssignUsers = jest.fn();
    const mockRefetch = jest.fn();

    useAssignedUsersMutation.mockClear().mockReturnValue({
      assignUsers: jest.fn(),
      unassignUsers: jest.fn(),
    });
    useAssignedUsers.mockReturnValue({
      users: mockUsers,
      isLoading: false,
      refetch: mockRefetch,
    });
    findObjectDifferences.mockClear().mockReturnValue({
      added: [{ id: '1' }],
      removed: [{ id: '2' }],
    });

    const renderComponentWithAssignUsers = (containerProps = {}, assignUsersProps = {}) => render(
      <AssignedUsersContainer {...containerProps}>
        <AssignedUsersList {...assignUsersProps} />
      </AssignedUsersContainer>
    );

    renderComponentWithAssignUsers(props, { users: mockUsers, assignUsers: mockAssignUsers });

    await waitFor(() => expect(screen.queryByText('Loading')).toBeNull());
    expect(screen.getByText('AssignedUsersList')).toBeInTheDocument();

    userEvent.click(screen.getByText('Assign/Unassign'));
    await waitFor(() => expect(mockRefetch).toBeCalled());
  });
});

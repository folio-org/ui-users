import React from 'react';
import { render, screen, waitFor } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

import AssignedUsersContainer from './AssignedUsersContainer';
import AssignedUsersList from './AssignedUsersList';
import useAssignedUsers from './hooks/useAssignedUsers';

jest.unmock('@folio/stripes/components');
jest.unmock('@folio/stripes/util');

jest.mock('@folio/stripes/components', () => ({
  ...jest.requireActual('@folio/stripes/components'),
  Loading: jest.fn(() => <div>Loading</div>),
}));

jest.mock('./hooks/useAssignedUsers/useAssignedUsers', () => jest.fn());
jest.mock('./AssignedUsersList', () => jest.fn(() => <div>AssignedUsersList</div>));

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

    renderComponent(props);

    await waitFor(() => expect(screen.queryByText('Loading')).toBeNull());
    expect(screen.getByText('AssignedUsersList')).toBeInTheDocument();
  });

  it('should toggle accordion button', async () => {
    useAssignedUsers.mockReturnValue({
      users: mockUsers,
      isLoading: false,
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

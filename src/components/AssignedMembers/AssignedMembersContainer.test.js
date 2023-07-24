import React from 'react';
import { render, screen, waitFor } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

import AssignedMembersContainer from './AssignedMembersContainer';
import useGetUsers from './hooks/useAssignedUsers/useAssignedUsers';
import AssignedMembersList from './AssignedMembersList';

jest.unmock('@folio/stripes/components');
jest.unmock('@folio/stripes/util');

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

jest.mock('@folio/stripes/components', () => ({
  ...jest.requireActual('@folio/stripes/components'),
  Loading: jest.fn(() => <div>Loading</div>),
}));

jest.mock('./hooks/useAssignedUsers/useAssignedUsers', () => jest.fn());
jest.mock('./AssignedMembersList', () => jest.fn(() => <div>AssignedMembersList</div>));


const renderComponent = (props = {}) => render(<AssignedMembersContainer {...props} />);

describe('AssignedMembersContainer', () => {
  const onToggle = jest.fn();
  const props = {
    grantedToIds: ['1', '2'],
    expanded: true,
    onToggle,
  };

  beforeEach(() => {
    AssignedMembersList.mockClear();
    useGetUsers.mockClear().mockReturnValue({
      users: [],
      isLoading: true,
    });
  });

  it('should render loading', async () => {
    renderComponent(props);

    expect(screen.getByText('Loading')).toBeInTheDocument();
  });

  it('should render AssignedMembersList', async () => {
    useGetUsers.mockReturnValue({
      users: mockUsers,
      isLoading: false,
    });

    renderComponent(props);

    await waitFor(() => expect(screen.queryByText('Loading')).toBeNull());
    expect(screen.getByText('AssignedMembersList')).toBeInTheDocument();
  });

  it('should render AssignedMembersList', async () => {
    useGetUsers.mockReturnValue({
      users: mockUsers,
      isLoading: false,
    });

    renderComponent({ ...props, expanded: false });

    await waitFor(() => expect(screen.queryByText('Loading')).toBeNull());
    expect(screen.getByText(mockUsers.length)).toBeInTheDocument();

    const accordionButton = screen.getByText('ui-users.permissions.assignedUsers');
    userEvent.click(accordionButton);

    await waitFor(() => expect(screen.getByText('AssignedMembersList')).toBeInTheDocument());
    expect(onToggle).toHaveBeenCalled();
  });
});


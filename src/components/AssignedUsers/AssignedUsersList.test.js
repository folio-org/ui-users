import React from 'react';
import {
  render,
  screen
} from '@folio/jest-config-stripes/testing-library/react';

import AssignedUsersList from './AssignedUsersList';

jest.unmock('@folio/stripes/components');
jest.unmock('@folio/stripes/util');

jest.mock('./AssignUsers', () => jest.fn(() => <div>AssignUsers</div>));

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

const renderComponent = (props) => render(<AssignedUsersList {...props} />);

describe('AssignedUsersList', () => {
  it('should render the component', async () => {
    const assignUsers = jest.fn();
    renderComponent({ users: mockUsers, assignUsers });
    expect(screen.getByText(mockUsers[0].fullName)).toBeInTheDocument();
    expect(screen.getByText(mockUsers[1].fullName)).toBeInTheDocument();
    expect(screen.getByText('AssignUsers')).toBeInTheDocument();
  });
});


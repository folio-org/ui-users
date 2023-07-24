import React from 'react';

import { render, screen } from '@folio/jest-config-stripes/testing-library/react';

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


const renderComponent = (users = mockUsers) => render(<AssignedMembersList users={users} />);

describe('AssignedMembersList', () => {
  it('should render the component', async () => {
    renderComponent();
    expect(screen.getByText(mockUsers[0].fullName)).toBeInTheDocument();
    expect(screen.getByText(mockUsers[1].fullName)).toBeInTheDocument();
  });
});


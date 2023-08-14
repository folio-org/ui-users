import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';

import AssignedUsersList from './AssignedUsersList';

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

const renderComponent = (props) => render(<AssignedUsersList {...props} />);

describe('AssignedUsersList', () => {
  it('should render the component', async () => {
    renderComponent({ users: mockUsers, isFetching: true });

    expect(screen.getByText(mockUsers[0].fullName)).toBeInTheDocument();
    expect(screen.getByText(mockUsers[1].fullName)).toBeInTheDocument();
  });
});

import React from 'react';
import {
  render,
  screen
} from '@folio/jest-config-stripes/testing-library/react';

import AssignUsers from './AssignUsers';

jest.unmock('@folio/stripes/components');
jest.unmock('@folio/stripes/util');

const stripes = {
  config: {},
  hasPerm: jest.fn().mockReturnValue(true),
};

const renderComponent = (props) => render(<AssignUsers {...props} />);

describe('AssignedUsersList', () => {
  it('should render the component', async () => {
    const assignUsers = jest.fn();
    renderComponent({ assignUsers, stripes, selectedUsers: [{ id: '1' }, { id: '2' }] });
    expect(screen.getByText('ui-users.permissions.assignUsers.actions.assign.notAvailable')).toBeInTheDocument();
  });
});


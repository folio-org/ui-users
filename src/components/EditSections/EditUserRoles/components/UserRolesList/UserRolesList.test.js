import { cleanup, render, screen } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';
import UserRolesList from './UserRolesList';

jest.unmock('@folio/stripes/components');

const assignedUserRoleIds = ['1', '2'];
const filteredRoles = [{ id: '1', name: 'role1' }];
const mockToggleRole = jest.fn();
const mockToggleAllRoles = jest.fn();

const renderComponent = (props) => render(<UserRolesList {...props} />);

describe('UserRolesList', () => {
  beforeEach(() => {
    renderComponent({ assignedUserRoleIds, filteredRoles, toggleRole:mockToggleRole, toggleAllRoles:mockToggleAllRoles });
  });
  afterAll(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it('renders UsersRoleList', () => {
    expect(document.querySelector('[data-test-user-roles-list="true"]')).toBeInTheDocument();
  });

  it('toggle select all roles', async () => {
    await userEvent.click(document.querySelector('[name="selected-selectAll"]'));

    expect(mockToggleAllRoles).toHaveBeenCalledTimes(1);
  });

  it('toggle select role', async () => {
    await userEvent.click(document.querySelector('[name="selected-1"]'));

    expect(mockToggleRole).toHaveBeenCalledTimes(1);
  });
});

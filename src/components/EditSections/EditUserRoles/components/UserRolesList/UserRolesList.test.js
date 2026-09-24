import { cleanup, render } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';
import { IfPermission } from '@folio/stripes/core';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import UserRolesList from './UserRolesList';

const history = createMemoryHistory();

jest.unmock('@folio/stripes/components');

const tenantId = 'consortium';
const assignedUserRoleIds = { 'consortium': ['1', '2'] };
const initialUserRoleIds = { 'consortium': ['1', '2'] };
const filteredRoles = [{ id: '1', name: 'role1' }];
const mockToggleRole = jest.fn();
const mockToggleAllRoles = jest.fn();

const renderComponent = (props) => {
  return render(
    <Router history={history}>
      <UserRolesList {...props} />
    </Router>
  );
};

describe('UserRolesList', () => {
  beforeEach(() => {
    renderComponent({ assignedUserRoleIds, initialUserRoleIds, filteredRoles, toggleRole: mockToggleRole, toggleRoleList: mockToggleAllRoles, tenantId });
  });
  afterAll(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it('renders UsersRoleList', () => {
    expect(document.querySelector('[data-test-user-roles-list="true"]')).toBeInTheDocument();
  });

  it('toggle select all roles', async () => {
    const selectAllCheckbox = document.querySelector('[name="selected-selectAll"]');
    expect(selectAllCheckbox).toBeChecked();

    await userEvent.click(selectAllCheckbox);

    expect(mockToggleAllRoles).toHaveBeenCalledWith(false, filteredRoles);
  });

  it('toggle select role', async () => {
    await userEvent.click(document.querySelector('[name="selected-1"]'));

    expect(mockToggleRole).toHaveBeenCalledWith('1');
  });

  it('shows unassigned status when the role is unassigned initially, even if currently checked live', () => {
    cleanup();
    renderComponent({
      assignedUserRoleIds: { consortium: ['1'] },
      initialUserRoleIds: { consortium: [] },
      filteredRoles,
      toggleRole: mockToggleRole,
      toggleRoleList: mockToggleAllRoles,
      tenantId
    });

    expect(document.querySelector('[data-test-role-status]')).toHaveTextContent('ui-users.roles.modal.unassigned');
  });

  it('shows assigned status when the role is assigned initially, even if currently unchecked live', () => {
    cleanup();
    renderComponent({
      assignedUserRoleIds: { consortium: [] },
      initialUserRoleIds: { consortium: ['1'] },
      filteredRoles,
      toggleRole: mockToggleRole,
      toggleRoleList: mockToggleAllRoles,
      tenantId
    });

    expect(document.querySelector('[data-test-role-status]')).toHaveTextContent('ui-users.roles.modal.assigned');
  });

  describe('role name link permission guard', () => {
    afterEach(() => {
      IfPermission.mockClear();
    });

    it('renders the role name as a link when the user has permission', () => {
      IfPermission.mockImplementation(({ children }) => children({ hasPermission: true }));
      cleanup();
      const { getByText } = renderComponent({ assignedUserRoleIds, initialUserRoleIds, filteredRoles, toggleRole: mockToggleRole, toggleRoleList: mockToggleAllRoles, tenantId });

      expect(getByText('role1').closest('a')).toHaveAttribute('href', '/settings/authorization-roles/1');
    });

    it('renders the role name as plain text when the user lacks permission', () => {
      IfPermission.mockImplementation(({ children }) => children({ hasPermission: false }));
      cleanup();
      const { getByText } = renderComponent({ assignedUserRoleIds, initialUserRoleIds, filteredRoles, toggleRole: mockToggleRole, toggleRoleList: mockToggleAllRoles, tenantId });

      expect(getByText('role1').closest('a')).not.toBeInTheDocument();
    });
  });
});

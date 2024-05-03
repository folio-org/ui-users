import { cleanup, render, waitFor } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';
import UserRolesModal from './UserRolesModal';

jest.mock('../../../../../hooks', () => {
  const mockAllRolesData = { data:{ roles: [{ id: '1', name: 'testRole' }, { id: '4', name: 'testRole4' }, { id: '3', name: 'testRole3' }] } };
  return { ...jest.requireActual('../../../../../hooks'),
    useAllRolesData: jest.fn().mockReturnValue(mockAllRolesData) };
});
jest.unmock('@folio/stripes/components');

const mockOnClose = jest.fn();
const mockAssignedRoles = [{ id: '1', name: 'testRole' }];

const renderComponent = (props = {}) => render(<div><UserRolesModal {...props} /></div>);

describe('UserRoleModal', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });
  it('renders user roles modal', async () => {
    const { getByText } = await waitFor(() => renderComponent({ isOpen: true, onClose: mockOnClose, assignedRoles: mockAssignedRoles, assignedRoleIds: ['1'], setAssignedRolesIds:jest.fn() }));

    expect(getByText('testRole')).toBeInTheDocument();
    expect(getByText('testRole4')).toBeInTheDocument();
    expect(getByText('testRole3')).toBeInTheDocument();
  });

  it('should call onClose function', async () => {
    await waitFor(() => renderComponent({ isOpen: true, onClose: mockOnClose, assignedRoles: mockAssignedRoles, assignedRoleIds: ['1'], setAssignedRolesIds:jest.fn() }));
    await userEvent.click(document.getElementById('user-roles-modal-close-button'));

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should select/unselect all roles, and ', async () => {
    renderComponent({ isOpen: true,
      onClose: mockOnClose,
      assignedRoles: mockAssignedRoles,
      assignedRoleIds: ['1'],
      setAssignedRolesIds:jest.fn() });

    const selectAllButton = document.querySelector('[name="selected-selectAll"]');
    await userEvent.click(selectAllButton);

    expect(selectAllButton.checked).toBe(true);

    const roleCheckbox = document.querySelector('[name="selected-1"]');
    expect(roleCheckbox.checked).toBe(true);

    await userEvent.click(roleCheckbox);

    expect(roleCheckbox.checked).toBe(false);
  });


  it('should show assigned roles only', async () => {
    const { queryByText } = renderComponent({ isOpen: true,
      onClose: mockOnClose,
      assignedRoles: mockAssignedRoles,
      assignedRoleIds: ['1'],
      setAssignedRolesIds:jest.fn() });

    const assignedFilterCheckbox = document.querySelector('[name="status.assigned"]');
    await userEvent.click(assignedFilterCheckbox);

    expect(assignedFilterCheckbox.checked).toBe(true);

    expect(queryByText('testRole3')).not.toBeInTheDocument();
  });

  it('should show unassigned roles only', async () => {
    const { getAllByRole } = renderComponent({ isOpen: true,
      onClose: mockOnClose,
      assignedRoles: mockAssignedRoles,
      assignedRoleIds: ['1'],
      setAssignedRolesIds:jest.fn() });

    const unassignedFilterCheckbox = document.querySelector('[name="status.unassigned"]');
    await userEvent.click(unassignedFilterCheckbox);

    expect(unassignedFilterCheckbox.checked).toBe(true);

    const numberOfGridCellPerRow = 3;
    const numberOfUnassignedRoles = 2;

    expect(getAllByRole('gridcell')).toHaveLength(numberOfGridCellPerRow * numberOfUnassignedRoles);
  });

  it('should reset all filters', async () => {
    renderComponent({ isOpen: true,
      onClose: mockOnClose,
      assignedRoles: mockAssignedRoles,
      assignedRoleIds: ['1'],
      setAssignedRolesIds:jest.fn() });

    const unassignedFilterCheckbox = document.querySelector('[name="status.unassigned"]');
    await userEvent.click(unassignedFilterCheckbox);
    expect(unassignedFilterCheckbox.checked).toBe(true);

    const assignedFilterCheckbox = document.querySelector('[name="status.assigned"]');
    await userEvent.click(assignedFilterCheckbox);
    expect(assignedFilterCheckbox.checked).toBe(true);

    const resetButton = document.querySelector('[data-test-reset-all-button="true"]');
    await userEvent.click(resetButton);
    expect(unassignedFilterCheckbox.checked).toBe(false);
    expect(assignedFilterCheckbox.checked).toBe(false);
  });

  it('should toggle filters pane', async () => {
    const { getByText } = renderComponent({ isOpen: true,
      onClose: mockOnClose,
      assignedRoles: mockAssignedRoles,
      assignedRoleIds: ['1'],
      setAssignedRolesIds:jest.fn() });

    const collapseButton = document.querySelector('[data-test-collapse-filter-pane-button="true"]');
    await userEvent.click(collapseButton);
    expect(getByText('stripes-smart-components.showSearchPane')).toBeInTheDocument();

    const expandButton = document.querySelector('[data-test-expand-filter-pane-button="true"]');
    await userEvent.click(expandButton);
    expect(getByText('stripes-smart-components.hideSearchPane')).toBeInTheDocument();
  });
});

import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';
import { screen } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';
import { useStripes } from '@folio/stripes/core';

import renderWithRouter from 'helpers/renderWithRouter';
import affiliations from 'fixtures/affiliations';
import {
  useConsortiumTenants,
  useUserAffiliations,
  useUserAffiliationsMutation,
  useCheckUserInKeycloak,
} from '../../../hooks';
import UserAffiliations from './UserAffiliations';
import { getResponseErrors } from './util';

const queryClient = new QueryClient();

jest.unmock('@folio/stripes/components');
jest.mock('../../../hooks', () => ({
  ...jest.requireActual('../../../hooks'),
  useConsortiumTenants: jest.fn(),
  useUserAffiliations: jest.fn(),
  useUserAffiliationsMutation: jest.fn(),
  useCheckUserInKeycloak: jest.fn(),
}));
jest.mock('@folio/stripes/core', () => ({
  ...jest.requireActual('@folio/stripes/core'),
  useStripes: jest.fn(),
}));
jest.mock('../../IfConsortiumPermission', () => jest.fn(({ children }) => children));

jest.mock('./util', () => ({
  getResponseErrors: jest.fn(() => []),
}));

const defaultProps = {
  accordionId: 'affiliations',
  expanded: true,
  onToggle: jest.fn(),
  userId: 'userId',
  userName: 'mobius',
};

const tenants = affiliations.map(({ tenantId, tenantName, primary }) => ({
  id: tenantId,
  name: tenantName,
  isPrimary: primary
}));

const renderUserAffiliations = (props = {}) => renderWithRouter(
  <QueryClientProvider client={queryClient}>
    <UserAffiliations
      {...defaultProps}
      {...props}
    />
  </QueryClientProvider>
);

describe('UserAffiliations', () => {
  const handleAssignment = jest.fn(() => Promise.resolve([]));

  beforeEach(() => {
    jest.clearAllMocks();
    useConsortiumTenants.mockClear().mockReturnValue({ tenants });
    useUserAffiliationsMutation.mockClear().mockReturnValue({ handleAssignment, isLoading: false });
    useStripes.mockClear().mockReturnValue({ user: { user: { tenants } }, hasInterface: jest.fn(() => false) });
    useCheckUserInKeycloak.mockClear().mockReturnValue({
      checkUserInKeycloakForTenant: jest.fn(() => Promise.resolve('exist')),
    });
    useUserAffiliations
      .mockClear()
      .mockReturnValue({ affiliations, totalRecords: affiliations.length, isLoading: false, handleAssignment: () => [{}], refetch: () => {} });
  });

  it('should render a list of user affiliations', () => {
    renderUserAffiliations();

    affiliations.map(({ tenantName }) => {
      return expect(screen.getByText(tenantName)).toBeInTheDocument();
    });
  });

  it('should render primary affiliation list item with \'primary\' class', () => {
    renderUserAffiliations();

    const primaryTenantListItem = screen.getByText(affiliations.find(({ isPrimary }) => isPrimary).tenantName);
    expect(primaryTenantListItem).toHaveClass('primary');
  });

  it.each`
    status
    ${'error'}
    ${'success'}
  `('should show $status message on click saveAndClose button', async ({ status }) => {
    let mockErrorData = [];
    if (status === 'error') {
      mockErrorData = [{
        'message': 'User with id [0c50701e-45ff-4a2e-bff0-11bd5610378d] has primary affiliation with tenant [mobius]. Primary Affiliation cannot be deleted',
        'type': '-1',
        'code': 'HAS_PRIMARY_AFFILIATION_ERROR'
      },
      {
        'message': 'Some error message',
        'type': '-1',
        'code': 'GENERIC_ERROR'
      }];
    }

    getResponseErrors.mockClear().mockReturnValue(mockErrorData);
    renderUserAffiliations();

    const assignButton = screen.getByText('ui-users.affiliations.section.action.edit');
    await userEvent.click(assignButton);
    const listOfAssignedTenants = await screen.findAllByRole('checkbox', {
      name: 'ui-users.affiliations.manager.modal.aria.assign',
      checked: true,
    });
    expect(listOfAssignedTenants).toHaveLength(affiliations.length - 1);
    const saveAndCloseButton = screen.getByText(/saveAndClose/);
    await userEvent.click(saveAndCloseButton);

    expect(handleAssignment).toHaveBeenCalled();
    expect(screen.queryByText(/saveAndClose/)).toBeNull();
  });

  describe('keycloak confirmation dialog', () => {
    const mockCheckUserInKeycloakForTenant = jest.fn();
    const mockHandleAssignment = jest.fn(() => Promise.resolve({ success: true, errors: [] }));

    beforeEach(() => {
      useStripes.mockReturnValue({
        user: { user: { tenants } },
        hasInterface: jest.fn((name) => name === 'users-keycloak'),
      });
      useCheckUserInKeycloak.mockReturnValue({
        checkUserInKeycloakForTenant: mockCheckUserInKeycloakForTenant,
      });
      useUserAffiliationsMutation.mockReturnValue({
        handleAssignment: mockHandleAssignment,
        isLoading: false,
      });
      // Return only a subset of affiliations so some tenants appear as "unassigned"
      // and can be toggled on to produce `added` entries.
      useUserAffiliations.mockReturnValue({
        affiliations: affiliations.slice(0, 1),
        totalRecords: 1,
        isFetching: false,
        refetch: jest.fn(),
      });
    });

    it('should show confirmation dialog when keycloak user does not exist for added tenant', async () => {
      mockCheckUserInKeycloakForTenant.mockResolvedValue('nonExist');

      renderUserAffiliations();

      const assignButton = screen.getByText('ui-users.affiliations.section.action.edit');
      await userEvent.click(assignButton);

      // Toggle an unassigned tenant to be assigned
      const uncheckedBoxes = await screen.findAllByRole('checkbox', {
        name: 'ui-users.affiliations.manager.modal.aria.assign',
        checked: false,
      });
      await userEvent.click(uncheckedBoxes[0]);

      const saveAndCloseButton = screen.getByText(/saveAndClose/);
      await userEvent.click(saveAndCloseButton);

      expect(mockCheckUserInKeycloakForTenant).toHaveBeenCalled();
      expect(screen.getByText('ui-users.keycloak.modal.confirmationHeading')).toBeInTheDocument();
    });

    it('should not show confirmation dialog when keycloak user exists for all added tenants', async () => {
      mockCheckUserInKeycloakForTenant.mockResolvedValue('exist');

      renderUserAffiliations();

      const assignButton = screen.getByText('ui-users.affiliations.section.action.edit');
      await userEvent.click(assignButton);

      const uncheckedBoxes = await screen.findAllByRole('checkbox', {
        name: 'ui-users.affiliations.manager.modal.aria.assign',
        checked: false,
      });
      await userEvent.click(uncheckedBoxes[0]);

      const saveAndCloseButton = screen.getByText(/saveAndClose/);
      await userEvent.click(saveAndCloseButton);

      expect(mockCheckUserInKeycloakForTenant).toHaveBeenCalled();
      expect(mockHandleAssignment).toHaveBeenCalled();
      expect(screen.queryByText('ui-users.keycloak.modal.confirmationHeading')).not.toBeInTheDocument();
    });

    it('should not check keycloak when users-keycloak interface is absent', async () => {
      mockCheckUserInKeycloakForTenant.mockClear();
      mockHandleAssignment.mockClear();
      useStripes.mockClear().mockReturnValue({
        user: { user: { tenants } },
        hasInterface: jest.fn(() => false),
      });

      renderUserAffiliations();

      const assignButton = screen.getByText('ui-users.affiliations.section.action.edit');
      await userEvent.click(assignButton);

      const uncheckedBoxes = await screen.findAllByRole('checkbox', {
        name: 'ui-users.affiliations.manager.modal.aria.assign',
        checked: false,
      });
      await userEvent.click(uncheckedBoxes[0]);

      const saveAndCloseButton = screen.getByText(/saveAndClose/);
      await userEvent.click(saveAndCloseButton);

      expect(mockCheckUserInKeycloakForTenant).not.toHaveBeenCalled();
      expect(mockHandleAssignment).toHaveBeenCalled();
    });
  });
});

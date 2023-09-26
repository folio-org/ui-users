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
  useUserAffiliationsMutation
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
    useConsortiumTenants.mockClear().mockReturnValue({ tenants });
    useUserAffiliationsMutation.mockClear().mockReturnValue({ handleAssignment, isLoading: false });
    useStripes.mockClear().mockReturnValue({ user: { user: { tenants } } });
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
    const saveAndCloseButton = screen.getByText('ui-users.saveAndClose');
    await userEvent.click(saveAndCloseButton);

    expect(handleAssignment).toHaveBeenCalled();
    expect(screen.queryByText('ui-users.saveAndClose')).toBeNull();
  });
});

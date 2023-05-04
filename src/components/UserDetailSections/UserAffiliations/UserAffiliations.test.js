import {
  screen,
  fireEvent,
  waitForElementToBeRemoved
} from '@testing-library/react';
import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';
import renderWithRouter from 'helpers/renderWithRouter';

import affiliations from '../../../../test/jest/fixtures/affiliations';
import {
  useUserAffiliations,
  useUserAffiliationsMutation
} from '../../../hooks';
import UserAffiliations from './UserAffiliations';
import { getResponseErrors } from '../../util/util';

const queryClient = new QueryClient();

jest.unmock('@folio/stripes/components');
jest.mock('../../../hooks', () => ({
  ...jest.requireActual('../../../hooks'),
  useUserAffiliations: jest.fn(),
  useUserAffiliationsMutation: jest.fn(),
}));

jest.mock('../../util/util', () => ({
  getResponseErrors: jest.fn(() => []),
}));

const defaultProps = {
  accordionId: 'affiliations',
  expanded: true,
  onToggle: jest.fn(),
  userId: 'userId',
};

const renderPatronBlock = (props = {}) => renderWithRouter(
  <QueryClientProvider client={queryClient}>
    <UserAffiliations
      {...defaultProps}
      {...props}
    />
  </QueryClientProvider>
);

describe('UserAffiliations', () => {
  beforeEach(() => {
    useUserAffiliationsMutation.mockClear().mockReturnValue({ handleAssignment: () => [], isLoading: false });
    useUserAffiliations
      .mockClear()
      .mockReturnValue({ affiliations, totalRecords: affiliations.length, isLoading: false, handleAssignment: () => [{}], refetch: () => {} });
  });

  it('should render a list of user affiliations', () => {
    renderPatronBlock();

    affiliations.map(({ tenantName }) => {
      return expect(screen.getByText(tenantName)).toBeInTheDocument();
    });
  });

  it('should render primary affiliation list item with \'primary\' class', () => {
    renderPatronBlock();

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
      mockErrorData = [{ message: 'error' }];
    }

    getResponseErrors.mockClear().mockReturnValue(mockErrorData);
    renderPatronBlock();

    const assignButton = screen.getByText('ui-users.affiliations.section.action.edit');
    fireEvent.click(assignButton);
    const listOfAssignedTenants = await screen.findAllByRole('checkbox');
    expect(listOfAssignedTenants).toHaveLength(2);
    const saveAndCloseButton = screen.getByText('ui-users.saveAndClose');
    fireEvent.click(saveAndCloseButton);
    await waitForElementToBeRemoved(() => screen.queryByText('ui-users.affiliations.manager.modal.title'));
    expect(screen.queryByText('ui-users.saveAndClos')).toBeNull();
  });
});

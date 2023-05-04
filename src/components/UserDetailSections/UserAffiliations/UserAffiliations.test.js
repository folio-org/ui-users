import {
  screen,
  waitForElementToBeRemoved
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
import { getResponseErrors } from './util';

const queryClient = new QueryClient();

jest.unmock('@folio/stripes/components');
jest.mock('@folio/stripes/core', () => ({
  ...jest.requireActual('@folio/stripes/core'),
  updateConsortium: jest.fn(),
  useStripes: jest.fn(() => ({})),
}));
jest.mock('../../../hooks', () => ({
  ...jest.requireActual('../../../hooks'),
  useUserAffiliations: jest.fn(),
  useUserAffiliationsMutation: jest.fn(),
}));

jest.mock('./util', () => ({
  getResponseErrors: jest.fn(() => []),
}));

const stripes = {
  user: {
    user: {
      id: 'userId',
    }
  },
  consortium: {
    activeAffiliation: {
      tenantId: affiliations[0].tenantId,
    },
    userAffiliations: affiliations,
  },
  store: {},
  hasPerm: jest.fn(() => true),
  hasInterface: jest.fn(() => true),
};

const defaultProps = {
  accordionId: 'affiliations',
  expanded: true,
  onToggle: jest.fn(),
  userId: 'userId',
  userName: 'mobius',
};

const renderUserAffiliations = (props = {}) => renderWithRouter(
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
    renderPatronBlock();

    const assignButton = screen.getByText('ui-users.affiliations.section.action.edit');
    userEvent.click(assignButton);
    const listOfAssignedTenants = await screen.findAllByRole('checkbox');
    expect(listOfAssignedTenants).toHaveLength(2);
    const saveAndCloseButton = screen.getByText('ui-users.saveAndClose');
    userEvent.click(saveAndCloseButton);
    await waitForElementToBeRemoved(() => screen.queryByText('ui-users.affiliations.manager.modal.title'));
    expect(screen.queryByText('ui-users.saveAndClos')).toBeNull();
  });
});

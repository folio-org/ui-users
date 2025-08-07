import { screen } from '@folio/jest-config-stripes/testing-library/react';
import '__mock__/stripesComponents.mock';
import renderWithRouter from 'helpers/renderWithRouter';

import UserLoans from './UserLoans';

jest.unmock('@folio/stripes/components');

jest.mock('../../Wrappers', () => ({
  ...jest.requireActual('../../Wrappers'),
  withCustomFields: jest.fn(Component => props => (
    <Component
      {...props}
      showCustomFieldsSection
    />
  )),
}));

const renderUserLoans = (extraprops) => renderWithRouter(<UserLoans {...extraprops} />);

function props(isexpanded, pending, claimedReturnedCount) {
  return {
    accordionId: 'userLoansSection',
    customFields: [],
    expanded: isexpanded,
    match:  { params: { id: 'mock-match-params-id' } },
    location: { search: 'search', pathname: 'pathname' },
    resources: {
      closedLoansCount:{
        resource: 'closedLoansCount',
        isPending: pending,
        records: [{ totalRecords: 1 }]
      },
      openLoansCount: {
        resource: 'openLoansCount',
        isPending: pending,
        records: [{ totalRecords: 1 }]
      },
      claimedReturnedCount: {
        resource: 'claimedReturnedCount',
        isPending: pending,
        records: [{ totalRecords: claimedReturnedCount }]
      },
      loansHistory: {
        records: []
      },
    }
  };
}

describe('Render User Loans component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('open accordion, loansLoaded is false', () => {
    renderUserLoans(props(true, true));
    expect(screen.queryByText('ui-users.loans.numOpenLoans')).not.toBeInTheDocument();
  });

  it('Correctly displays open and closed loan counts', () => {
    renderUserLoans(props(true, false));
    expect(screen.getByText('ui-users.loans.numClosedLoans')).toBeInTheDocument();
    expect(screen.getByText('ui-users.loans.numOpenLoans')).toBeInTheDocument();
  });

  it('closed accordion, loansLoaded is false', () => {
    renderUserLoans(props(false, true));
    expect(screen.queryByText('ui-users.loans.numOpenLoans')).not.toBeInTheDocument();
  });

  it('claimed return count is > 0', () => {
    renderUserLoans(props(true, false, 1));
    expect(screen.getByText('ui-users.loans.numClaimedReturnedLoans')).toBeInTheDocument();
  });

  it('claimed return count is 0', () => {
    renderUserLoans(props(true, false, 0));
    expect(screen.queryByText('ui-users.loans.numClaimedReturnedLoans')).not.toBeInTheDocument();
  });

  describe('when custom fields are present', () => {
    it('should display "ViewCustomFieldsRecord"', () => {
      renderUserLoans(props(true));

      expect(screen.getByText('ViewCustomFieldsRecord')).toBeInTheDocument();
    });
  });
});

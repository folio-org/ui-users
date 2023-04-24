import { screen } from '@testing-library/react';

import renderWithRouter from 'helpers/renderWithRouter';

import affiliations from '../../../../test/jest/fixtures/affiliations';
import { useUserAffiliations } from '../../../hooks';
import UserAffiliations from './UserAffiliations';

jest.unmock('@folio/stripes/components');
jest.mock('../../../hooks', () => ({
  ...jest.requireActual('../../../hooks'),
  useUserAffiliations: jest.fn(() => ({ affiliations: [], totalRecords: 0 })),
  useUserAffiliationsMutation: jest.fn(() => ({ handleAssignment: jest.fn(), isLoading: false })),
}));

const defaultProps = {
  accordionId: 'affiliations',
  expanded: true,
  onToggle: jest.fn(),
  userId: 'userId',
};

const renderPatronBlock = (props = {}) => renderWithRouter(
  <UserAffiliations
    {...defaultProps}
    {...props}
  />
);

describe('render UserAffiliations accordion component', () => {
  beforeEach(() => {
    useUserAffiliations
      .mockClear()
      .mockReturnValue({ affiliations, totalRecords: affiliations.length });
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
});

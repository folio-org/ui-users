import { render, within } from '@folio/jest-config-stripes/testing-library/react';

import '__mock__/matchMedia.mock';

import affiliations from 'fixtures/affiliations';
import AffiliationsSelect from './AffiliationsSelect';

jest.unmock('@folio/stripes/components');
jest.unmock('@folio/stripes/smart-components');

const defaultProps = {
  id: 'test',
  affiliations,
  value: affiliations[2].tenantId,
  onChange: jest.fn(),
  isLoading: false,
};

const renderAffiliationsSelect = (props = {}) => render(
  <AffiliationsSelect
    {...defaultProps}
    {...props}
  />,
);

describe('AffiliationsSelect', () => {
  it('should render affiliation select with provided options', () => {
    renderAffiliationsSelect();

    expect(
      within(document.getElementById('test-affiliations-select'))
        .getByText(affiliations[2].tenantName)
    ).toBeInTheDocument();
    affiliations.forEach(({ tenantName, isPrimary }) => {
      expect(
        within(document.getElementById('sl-test-affiliations-select'))
          .getByText(isPrimary ? `${tenantName} ui-users.affiliations.primary.label` : tenantName),
      ).toBeInTheDocument();
    });
  });
});

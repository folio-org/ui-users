import {
  screen,
  within,
} from '@folio/jest-config-stripes/testing-library/react';

import renderWithRouter from 'helpers/renderWithRouter';

import { useUserSpecificLoanAnonymization } from '../../../../../hooks';
import LoanAnonymizationPreferenceView from './LoanAnonymizationPreferenceView';

jest.unmock('@folio/stripes/components');

jest.mock('../../../../../hooks', () => ({
  ...jest.requireActual('../../../../../hooks'),
  useUserSpecificLoanAnonymization: jest.fn(),
}));

describe('LoanAnonymizationPreferenceView', () => {
  beforeEach(() => {
    useUserSpecificLoanAnonymization.mockReturnValue({ isEnabled: true, isLoading: false });
  });

  it.each([
    [undefined, 'ui-users.extended.loanAnonymizationPreference.libraryPolicy'],
    ['libraryPolicy', 'ui-users.extended.loanAnonymizationPreference.libraryPolicy'],
    ['asEarlyAsPossible', 'ui-users.extended.loanAnonymizationPreference.asEarlyAsPossible'],
    ['never', 'ui-users.extended.loanAnonymizationPreference.never'],
  ])('should show the label for preference %s', (preference, label) => {
    renderWithRouter(<LoanAnonymizationPreferenceView preference={preference} />);

    const keyValue = screen.getByTestId('loan-anonymization-preference');

    expect(within(keyValue).getByText('ui-users.extended.loanAnonymizationPreference')).toBeInTheDocument();
    expect(within(keyValue).getByText(label)).toBeInTheDocument();
  });

  it('should show an unknown value as stored', () => {
    renderWithRouter(<LoanAnonymizationPreferenceView preference="somethingElse" />);

    expect(screen.getByText('somethingElse')).toBeInTheDocument();
  });

  it('should be hidden when user-specific loan anonymization is not enabled or the setting cannot be read', () => {
    useUserSpecificLoanAnonymization.mockReturnValue({ isEnabled: false, isLoading: false });

    renderWithRouter(<LoanAnonymizationPreferenceView preference="never" />);

    expect(screen.queryByText('ui-users.extended.loanAnonymizationPreference')).not.toBeInTheDocument();
  });
});

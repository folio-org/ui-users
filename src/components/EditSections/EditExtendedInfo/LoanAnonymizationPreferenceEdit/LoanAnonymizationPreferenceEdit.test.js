import PropTypes from 'prop-types';
import { Form } from 'react-final-form';

import { screen } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

import renderWithRouter from 'helpers/renderWithRouter';

import { useUserSpecificLoanAnonymization } from '../../../../hooks';
import LoanAnonymizationPreferenceEdit from './LoanAnonymizationPreferenceEdit';

jest.unmock('@folio/stripes/components');

jest.mock('../../../../hooks', () => ({
  ...jest.requireActual('../../../../hooks'),
  useUserSpecificLoanAnonymization: jest.fn(),
}));

const onSubmit = jest.fn();

const TestForm = ({ disabled }) => (
  <Form
    onSubmit={onSubmit}
    initialValues={TestForm.initialValues}
    render={({ handleSubmit }) => (
      <form onSubmit={handleSubmit}>
        <LoanAnonymizationPreferenceEdit disabled={disabled} />
        <button type="submit">submit</button>
      </form>
    )}
  />
);

TestForm.propTypes = {
  disabled: PropTypes.bool,
};

const renderComponent = ({ initialValues = { id: 'user-id' }, disabled } = {}) => {
  TestForm.initialValues = initialValues;

  return renderWithRouter(<TestForm disabled={disabled} />);
};

const getSelect = () => screen.getByRole('combobox', { name: 'ui-users.extended.loanAnonymizationPreference' });

const submit = async () => {
  await userEvent.click(screen.getByRole('button', { name: 'submit' }));

  return onSubmit.mock.calls[0][0];
};

describe('LoanAnonymizationPreferenceEdit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useUserSpecificLoanAnonymization.mockReturnValue({ isEnabled: true, isLoading: false });
  });

  it('should show the three options', () => {
    renderComponent();

    expect(screen.getByRole('option', { name: 'ui-users.extended.loanAnonymizationPreference.libraryPolicy' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'ui-users.extended.loanAnonymizationPreference.asEarlyAsPossible' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'ui-users.extended.loanAnonymizationPreference.never' })).toBeInTheDocument();
  });

  it('should show "According to library policy" when no preference is stored', () => {
    renderComponent();

    expect(getSelect()).toHaveValue('libraryPolicy');
  });

  it('should not add the default to the saved user when the field is not changed', async () => {
    renderComponent();

    const values = await submit();

    expect(values).not.toHaveProperty('loanAnonymizationPreference');
  });

  it('should show the stored preference', () => {
    renderComponent({ initialValues: { id: 'user-id', loanAnonymizationPreference: 'never' } });

    expect(getSelect()).toHaveValue('never');
  });

  it('should save the selected preference', async () => {
    renderComponent();

    await userEvent.selectOptions(getSelect(), 'asEarlyAsPossible');
    const values = await submit();

    expect(values.loanAnonymizationPreference).toBe('asEarlyAsPossible');
  });

  it('should save "libraryPolicy" when it is selected explicitly', async () => {
    renderComponent({ initialValues: { id: 'user-id', loanAnonymizationPreference: 'never' } });

    await userEvent.selectOptions(getSelect(), 'libraryPolicy');
    const values = await submit();

    expect(values.loanAnonymizationPreference).toBe('libraryPolicy');
  });

  it('should be disabled when the form is disabled', () => {
    renderComponent({ disabled: true });

    expect(getSelect()).toBeDisabled();
  });

  describe('when user-specific loan anonymization is not enabled or the setting cannot be read', () => {
    beforeEach(() => {
      useUserSpecificLoanAnonymization.mockReturnValue({ isEnabled: false, isLoading: false });
    });

    it('should hide the field', () => {
      renderComponent();

      expect(screen.queryByText('ui-users.extended.loanAnonymizationPreference')).not.toBeInTheDocument();
    });

    it('should keep the stored preference when the user is saved', async () => {
      renderComponent({ initialValues: { id: 'user-id', loanAnonymizationPreference: 'never' } });

      const values = await submit();

      expect(values.loanAnonymizationPreference).toBe('never');
    });
  });
});

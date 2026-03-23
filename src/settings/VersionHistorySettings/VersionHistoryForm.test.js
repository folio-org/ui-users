import React from 'react';
import { screen, waitFor } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

import renderWithRouter from 'helpers/renderWithRouter';
import VersionHistoryForm from './VersionHistoryForm';
import { RETENTION_MODES } from './constants';

import '__mock__/stripesCore.mock';

jest.unmock('@folio/stripes/components');
jest.unmock('@folio/stripes/smart-components');

const defaultProps = {
  initialValues: {
    retentionMode: RETENTION_MODES.NEVER,
    durationLength: '',
    durationUnit: '',
    anonymizeSource: false,
    excludedFields: [],
  },
  onSubmit: jest.fn(),
  fieldOptions: [
    { value: 'personal.email', label: 'Email' },
    { value: 'personal.phone', label: 'Phone' },
  ],
};

const renderForm = (props = {}) => renderWithRouter(
  <VersionHistoryForm {...defaultProps} {...props} />,
);

describe('VersionHistoryForm', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form with radio buttons', async () => {
    await waitFor(() => renderForm());

    expect(screen.getByText('ui-users.settings.versionHistory')).toBeInTheDocument();
    expect(screen.getByLabelText(/ui-users.settings.versionHistory.never/)).toBeInTheDocument();
    expect(screen.getByLabelText(/ui-users.settings.versionHistory.retainIndefinitely/)).toBeInTheDocument();
  });

  it('disables duration fields when "Never" is selected', async () => {
    await waitFor(() => renderForm());

    const lengthInput = document.querySelector('[name="durationLength"]');
    const unitSelect = document.querySelector('[name="durationUnit"]');

    expect(lengthInput).toBeDisabled();
    expect(unitSelect).toBeDisabled();
  });

  it('disables anonymize checkbox when "Never" is selected', async () => {
    await waitFor(() => renderForm());

    const checkbox = document.querySelector('[name="anonymizeSource"]');

    expect(checkbox).toBeDisabled();
  });

  it('enables duration fields when "Retain for a set duration" is selected', async () => {
    await waitFor(() => renderForm({
      initialValues: {
        ...defaultProps.initialValues,
        retentionMode: RETENTION_MODES.DURATION,
        durationLength: '6',
        durationUnit: 'months',
      },
    }));

    const lengthInput = document.querySelector('[name="durationLength"]');
    const unitSelect = document.querySelector('[name="durationUnit"]');

    expect(lengthInput).not.toBeDisabled();
    expect(unitSelect).not.toBeDisabled();
  });

  it('enables anonymize checkbox when "Retain indefinitely" is selected', async () => {
    await waitFor(() => renderForm({
      initialValues: {
        ...defaultProps.initialValues,
        retentionMode: RETENTION_MODES.INDEFINITELY,
      },
    }));

    const checkbox = document.querySelector('[name="anonymizeSource"]');

    expect(checkbox).not.toBeDisabled();
  });

  it('renders save button as disabled when form is pristine', async () => {
    await waitFor(() => renderForm());

    const saveButton = screen.getByText('stripes-core.button.save').closest('button');

    expect(saveButton).toBeDisabled();
  });

  it('enables save button when form is dirty', async () => {
    await waitFor(() => renderForm());

    await userEvent.click(screen.getByLabelText(/ui-users.settings.versionHistory.retainIndefinitely/));

    const saveButton = screen.getByText('stripes-core.button.save').closest('button');

    expect(saveButton).not.toBeDisabled();
  });
});

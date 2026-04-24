import React from 'react';
import { screen, waitFor } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';
import { useCallout } from '@folio/stripes/core';

import renderWithRouter from 'helpers/renderWithRouter';
import VersionHistorySettings from './VersionHistorySettings';
import useVersionHistorySettings from './useVersionHistorySettings';

import '__mock__/stripesCore.mock';
import '__mock__/stripesComponents.mock';
import '__mock__/stripesSmartComponent.mock';

jest.mock('./useVersionHistorySettings');

jest.mock('./VersionHistoryForm', () => {
  return jest.fn(({ onSubmit, initialValues }) => (
    <div data-testid="version-history-form">
      <span>{JSON.stringify(initialValues)}</span>
      <button
        type="button"
        onClick={() => onSubmit({
          retentionMode: 'indefinitely',
          anonymizeSource: false,
          excludedFields: [],
        })}
      >
        Save non-destructive
      </button>
      <button
        type="button"
        onClick={() => onSubmit({
          retentionMode: 'never',
          anonymizeSource: false,
          excludedFields: [],
        })}
      >
        Save destructive
      </button>
    </div>
  ));
});

jest.mock('./VersionHistoryWarningModal', () => {
  return jest.fn(({ open, onConfirm, onCancel }) => (
    <div data-testid="warning-modal" data-open={open}>
      <button type="button" onClick={onConfirm}>Confirm</button>
      <button type="button" onClick={onCancel}>Cancel</button>
    </div>
  ));
});

const mockSaveSettings = jest.fn().mockResolvedValue();
const mockSendCallout = jest.fn();

const enabledSettings = [
  { key: 'enabled', value: true },
  { key: 'records.retention.period', value: -1 },
  { key: 'anonymize', value: false },
  { key: 'excluded.fields', value: '[]' },
];

const disabledSettings = [
  { key: 'enabled', value: false },
  { key: 'records.retention.period', value: -1 },
  { key: 'anonymize', value: false },
  { key: 'excluded.fields', value: '[]' },
];

describe('VersionHistorySettings', () => {
  beforeEach(() => {
    useVersionHistorySettings.mockReturnValue({
      settings: enabledSettings,
      isLoading: false,
      saveSettings: mockSaveSettings,
    });
    useCallout.mockReturnValue({ sendCallout: mockSendCallout });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form when settings are loaded', () => {
    renderWithRouter(<VersionHistorySettings />);

    expect(screen.getByTestId('version-history-form')).toBeInTheDocument();
  });

  it('shows loading when settings are loading', () => {
    useVersionHistorySettings.mockReturnValue({
      settings: [],
      isLoading: true,
      saveSettings: mockSaveSettings,
    });

    renderWithRouter(<VersionHistorySettings />);

    expect(screen.queryByTestId('version-history-form')).not.toBeInTheDocument();
  });

  it('saves directly when no warnings', async () => {
    useVersionHistorySettings.mockReturnValue({
      settings: disabledSettings,
      isLoading: false,
      saveSettings: mockSaveSettings,
    });

    renderWithRouter(<VersionHistorySettings />);

    await userEvent.click(screen.getByText('Save non-destructive'));

    await waitFor(() => {
      expect(mockSaveSettings).toHaveBeenCalled();
      expect(mockSendCallout).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'ui-users.settings.versionHistory.save.success' }),
      );
    });
  });

  it('shows warning modal for destructive changes', async () => {
    renderWithRouter(<VersionHistorySettings />);

    await userEvent.click(screen.getByText('Save destructive'));

    await waitFor(() => {
      expect(screen.getByTestId('warning-modal')).toHaveAttribute('data-open', 'true');
    });
  });

  it('saves after confirming warning modal', async () => {
    renderWithRouter(<VersionHistorySettings />);

    await userEvent.click(screen.getByText('Save destructive'));

    await waitFor(() => {
      expect(screen.getByTestId('warning-modal')).toHaveAttribute('data-open', 'true');
    });

    await userEvent.click(screen.getByText('Confirm'));

    await waitFor(() => {
      expect(mockSaveSettings).toHaveBeenCalled();
    });
  });

  it('closes modal on cancel', async () => {
    renderWithRouter(<VersionHistorySettings />);

    await userEvent.click(screen.getByText('Save destructive'));

    await waitFor(() => {
      expect(screen.getByTestId('warning-modal')).toHaveAttribute('data-open', 'true');
    });

    await userEvent.click(screen.getByText('Cancel'));

    await waitFor(() => {
      expect(screen.getByTestId('warning-modal')).toHaveAttribute('data-open', 'false');
    });
  });

  it('shows error callout on save failure', async () => {
    mockSaveSettings.mockRejectedValueOnce(new Error('Save failed'));

    useVersionHistorySettings.mockReturnValue({
      settings: disabledSettings,
      isLoading: false,
      saveSettings: mockSaveSettings,
    });

    renderWithRouter(<VersionHistorySettings />);

    await userEvent.click(screen.getByText('Save non-destructive'));

    await waitFor(() => {
      expect(mockSendCallout).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'error' }),
      );
    });
  });
});

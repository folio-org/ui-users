import React from 'react';
import { screen, render } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

import '__mock__/stripesCore.mock';
import '__mock__/stripesComponents.mock';

import VersionHistoryWarningModal from './VersionHistoryWarningModal';

const defaultProps = {
  open: true,
  warnings: [
    { type: 'purgeAll' },
    { type: 'anonymize' },
  ],
  onConfirm: jest.fn(),
  onCancel: jest.fn(),
};

const renderComponent = (props = {}) => render(
  <VersionHistoryWarningModal {...defaultProps} {...props} />,
);

describe('VersionHistoryWarningModal', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders modal with warnings when open', () => {
    renderComponent();

    expect(screen.getByText('ui-users.settings.versionHistory.warning.title')).toBeInTheDocument();
    expect(screen.getByText('ui-users.settings.versionHistory.warning.purgeAll')).toBeInTheDocument();
    expect(screen.getByText('ui-users.settings.versionHistory.warning.anonymize')).toBeInTheDocument();
  });

  it('passes open=false to Modal when not open', () => {
    renderComponent({ open: false });

    expect(screen.getByText('ui-users.settings.versionHistory.warning.title')).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button clicked', async () => {
    renderComponent();

    await userEvent.click(screen.getByText('ui-users.settings.versionHistory.warning.confirm'));

    expect(defaultProps.onConfirm).toHaveBeenCalled();
  });

  it('calls onCancel when cancel button clicked', async () => {
    renderComponent();

    await userEvent.click(screen.getByText('ui-users.settings.versionHistory.warning.cancel'));

    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  it('renders retention shortened warning with period', () => {
    renderComponent({
      warnings: [{ type: 'retentionShortened', formattedPeriod: '6 months' }],
    });

    expect(screen.getByText('ui-users.settings.versionHistory.warning.retentionShortened')).toBeInTheDocument();
  });
});

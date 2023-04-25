import React from 'react';

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ControlledVocab } from '@folio/stripes/smart-components';

import '__mock__/stripesCore.mock';
import '__mock__/stripesSmartComponent.mock';
import '__mock__/intl.mock';

import renderWithRouter from 'helpers/renderWithRouter';
import TransferAccountsSettings from './TransferAccountsSettings';

jest.unmock('@folio/stripes/components');

jest.mock('@folio/stripes/smart-components', () => ({
  ...jest.requireActual('@folio/stripes/smart-components'),
  ControlledVocab: jest.fn(props => (
    <div>
      <input
        data-testid="ownerId-input"
        value={props.ownerId}
        onChange={props.onChange}
      />
      <button
        type="button"
        data-testid="preCreateHook-button"
        onClick={() => props.preCreateHook({})}
      >
        Pre-create Hook
      </button>
    </div>
  )),
}));

const defaultProps = {
  intl: {
    formatMessage: jest.fn(),
  },
  mutator: {
    owners: {
      reset: jest.fn(),
      GET: jest.fn().mockResolvedValue([]),
    },
  },
};

const renderTransferAccountsSettings = () => renderWithRouter(<TransferAccountsSettings {...defaultProps} />);

describe('TransferAccountsSettings', () => {
  beforeEach(() => {
    renderTransferAccountsSettings();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should call onChangeOwner when ownerId input value changes', async () => {
    const ownerIdInput = screen.getByTestId('ownerId-input');
    expect(ownerIdInput).toHaveValue('');
    userEvent.type(ownerIdInput, 'testing purpose');
    expect(ownerIdInput).toHaveValue('testing purpose');
  });
  it('should call preCreateHook when preCreateHook button is clicked', async () => {
    const preCreateHookButton = screen.getByTestId('preCreateHook-button');
    userEvent.click(preCreateHookButton);
    expect(ControlledVocab).toHaveBeenCalledTimes(2);
  });
});

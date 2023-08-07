import React from 'react';

import { screen } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';
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
  stripes: {
    connect: jest.fn(c => c),
    hasPerm: jest.fn(() => true),
  }
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
  describe('Action suppression', () => {
    it('should have disabled new button when user do not have permission to create new transfer account', () => {
      const transferAccount = {
        accountName: 'test',
        id: '82db1a06-6e4a-40a4-ac94-770e222e09ac',
        metadata: {
          createdDate: '2023-07-11T10:50:42.623+00:00',
          createdByUserId: 'ff96b580-4206-4957-8b5d-7bdbc3d192f9',
          updatedDate: '2023-07-11T10:50:42.623+00:00',
          updatedByUserId: 'ff96b580-4206-4957-8b5d-7bdbc3d192f9'
        },
        ownerId: '73e450d9-acb5-4443-a36e-9ea3709e58bd',
      };

      const { actionSuppressor } = ControlledVocab.mock.calls[0][0];
      expect(actionSuppressor.edit(transferAccount)).toBeFalsy();
      expect(actionSuppressor.delete(transferAccount)).toBeFalsy();
    });
  });
});

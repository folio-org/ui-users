import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import okapiCurrentUser from 'fixtures/okapiCurrentUser';
import account from 'fixtures/account';

import renderWithRouter from 'helpers/renderWithRouter';
import Menu from './Menu';

import '__mock__/stripesCore.mock';
import '__mock__/stripesSmartComponent.mock';

jest.unmock('@folio/stripes/components');

const renderMenu = (props) => renderWithRouter(
  <Menu {...props} />
);

const onChangeMock = jest.fn();

const props = (accountData, filter, status) => {
  return {
    user: okapiCurrentUser,
    stripes: {
      hasPerm: jest.fn().mockReturnValue(true),
    },
    showFilters: filter,
    selected: 1,
    filters: {
      'test': 'filter',
      'test2': 'filter2'
    },
    actions: {
      regularpayment: true,
      waive: true,
      refund: true,
      transfer: true
    },
    match: {
      params: {
        accountstatus: status
      }
    },
    patronGroup: {},
    selectedAccounts: [],
    feeFineActions: [],
    accounts: [accountData],
    onChangeActions: onChangeMock,
    onExportFeesFinesReport: jest.fn()
  };
};

const acc = {
  'id' : 'b6475706-4505-4b20-9ed0-aadcda2b72ee',
  'paymentStatus': {
    'name': 'Suspended claim returned'
  },
  'remaining' : 20,
};

describe('Menu component', () => {
  describe('Checking Menu', () => {
    it('if it renders', () => {
      renderMenu(props(account, true, 'Open'));
      expect(document.querySelector('[ id="outstanding-balance"]')).toBeInTheDocument();
    });
    it('Pay All feature', () => {
      renderMenu(props(account, true, 'Open'));
      userEvent.click(document.querySelector('[id="open-closed-all-pay-button"]'));
      expect(onChangeMock).toHaveBeenCalled();
    });
    it('Waive feature', () => {
      renderMenu(props(account, true, 'Open'));
      userEvent.click(document.querySelector('[id="open-closed-all-wave-button"]'));
      expect(onChangeMock).toHaveBeenCalled();
    });
    it('Tranfser feature', () => {
      renderMenu(props(account, true, 'Open'));
      userEvent.click(document.querySelector('[id="open-closed-all-transfer-button"]'));
      expect(onChangeMock).toHaveBeenCalled();
    });
    it('Suspended Claim feature', () => {
      renderMenu(props(acc, true, 'Open'));
      expect(document.querySelector('[id="outstanding-balance"]')).toBeInTheDocument();
    });
    it('Filter feature', () => {
      renderMenu(props(acc, false, 'closed'));
      screen.debug();
      expect(document.querySelector('[src="https://png.icons8.com/color/40/f39c12/filled-filter.png"]')).toBeInTheDocument();
    });
  });
});

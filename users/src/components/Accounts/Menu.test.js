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

describe('Menu component', () => {
  describe('Checking Menu', () => {
    it('if it renders', () => {
      renderMenu(props(account, true, 'Open'));
      expect(document.querySelector('[ id="outstanding-balance"]')).toBeInTheDocument();
    });
  });
});

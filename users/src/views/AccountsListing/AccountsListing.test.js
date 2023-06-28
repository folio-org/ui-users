import React from 'react';
import { createMemoryHistory } from 'history';

import '__mock__/stripesCore.mock';
import renderWithRouter from 'helpers/renderWithRouter';
import account from 'fixtures/account';
import okapiCurrentUser from 'fixtures/okapiCurrentUser';

import AccountsHistory from './AccountsListing';

jest.mock('../../components/Accounts/Actions/FeeFineActions', () => () => <></>);

jest.unmock('@folio/stripes/components');

const history = createMemoryHistory();

const props = {
  history,
  location: history.location,
  match: { params: {} },
  isLoading: false,

  resources: {
    feefineshistory: { records: [] },
    accountActions: {},
    accounts: {},
    feefineactions: {},
    loans: {},
    user: {
      update: jest.fn(),
    },
    servicePoints: {},
  },
  mutator: {
    activeRecord: {
      update: jest.fn(),
    },
    feefineactions: {
      POST: jest.fn(),
    },
    accountActions: {
      GET: jest.fn(),
    },
    user: {
      update: jest.fn(),
    },
  },
  num: 42,
  user: { id: '123' },
  patronGroup: { group: 'Shiny happy people' },
  itemDetails: {},
  stripes: {
    hasPerm: jest.fn().mockReturnValue(true),
    connect: (Component) => Component,
  },
  account,
  owedAmount: 45.67,
  intl: {},
  okapi: {
    url: 'https://localhost:9130',
    tenant: 'diku',
    okapiReady: true,
    authFailure: [],
    bindings: {},
    currentUser: okapiCurrentUser,
  },
};

const renderAccountsListing = (extraProps = {}) => renderWithRouter(
  <AccountsHistory {...props} {...extraProps} />
);

afterEach(() => jest.clearAllMocks());

describe('Checking Action Menu', () => {
  test('AccountListing pane should be present', async () => {
    renderAccountsListing({ account });
    expect(document.querySelector('#pane-account-listing')).toBeInTheDocument();
  });

  test('New fee/fine button should be present', () => {
    renderAccountsListing({ account });
    expect(document.querySelector('#open-closed-all-charge-button')).toBeInTheDocument();
  });

  test('Pay button should be present', () => {
    renderAccountsListing({ account });
    expect(document.querySelector('#open-closed-all-pay-button')).toBeInTheDocument();
  });

  test('Section show columns should be present', () => {
    renderAccountsListing({ account });
    expect(document.querySelector('#sectionShowColumns')).toBeInTheDocument();
  });
});

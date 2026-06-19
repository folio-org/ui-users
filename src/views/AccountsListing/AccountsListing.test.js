import React, { act } from 'react';
import { createMemoryHistory } from 'history';

import '__mock__/stripesCore.mock';
import renderWithRouter from 'helpers/renderWithRouter';
import account from 'fixtures/account';
import okapiCurrentUser from 'fixtures/okapiCurrentUser';

import isRefundAllowed from '../../components/util/isRefundAllowed';
import AccountsHistory from './AccountsListing';

jest.mock('../../components/Accounts/Actions/FeeFineActions', () => () => <></>);

// Captures onChangeSelected / onChangeActions from the rendered ViewFeesFines instance.
// The `callbacks` object lives inside the factory closure so it is accessible via _getCallbacks()
// without any module-level variable that would conflict with Jest's hoisting rules.
jest.mock('../../components/Accounts', () => {
  const callbacks = {};

  return {
    // eslint-disable-next-line react/prop-types
    ViewFeesFines: ({ onChangeSelected, onChangeActions }) => {
      callbacks.onChangeSelected = onChangeSelected;
      callbacks.onChangeActions = onChangeActions;
      return null;
    },
    Filters: () => null,
    Menu: () => null,
    _getCallbacks: () => callbacks,
  };
});

jest.mock('../../components/util/isRefundAllowed', () => jest.fn());

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

describe('getActionMenu - allAccounts lookup for canRefund (refund button state)', () => {
  // Access the callback store exposed by the ../../components/Accounts mock.
  // require() is used because the mock module is not an ES-module default export.
  // eslint-disable-next-line global-require
  const { _getCallbacks } = require('../../components/Accounts');

  const accountId = 'test-account-id-123';
  const selectedAccount = { id: accountId };

  // Render with params.accountstatus = 'all' so ViewFeesFines renders and captures callbacks.
  const propsWithStatus = {
    ...props,
    match: { params: { accountstatus: 'all', id: '123' } },
  };

  beforeEach(() => {
    // Reset mock implementation and call history before each test.
    isRefundAllowed.mockReset();
  });

  it('maps selectedAccounts to {} (fallback) and disables refund button when feefineshistory is undefined', async () => {
    // allAccounts = [] (resources?.feefineshistory?.records || [] fallback)
    // find() returns undefined → selectedAccount becomes {}
    // isRefundAllowed({}) → false → canRefund = false → button disabled
    isRefundAllowed.mockReturnValue(false);

    renderAccountsListing({
      ...propsWithStatus,
      resources: { ...props.resources, feefineshistory: undefined },
    });

    await act(async () => {
      _getCallbacks().onChangeSelected(90, [selectedAccount]);
      _getCallbacks().onChangeActions({ refund: true });
    });

    expect(document.querySelector('#open-closed-all-refund-button')).toBeDisabled();
    // Verify isRefundAllowed was called with the {} fallback, not real account data
    expect(isRefundAllowed).toHaveBeenCalledWith({}, []);
  });

  it('maps selectedAccount to {} (fallback) and disables refund button when id is not found in feefineshistory records', async () => {
    // allAccounts has a record with a DIFFERENT id → find() returns undefined → fallback {}
    isRefundAllowed.mockReturnValue(false);

    renderAccountsListing({
      ...propsWithStatus,
      resources: {
        ...props.resources,
        feefineshistory: {
          records: [{
            id: 'different-id',
            paymentStatus: { name: 'Paid fully' },
            amount: 100,
            remaining: 0,
            status: { name: 'Closed' },
          }],
        },
      },
    });

    await act(async () => {
      _getCallbacks().onChangeSelected(90, [selectedAccount]);
      _getCallbacks().onChangeActions({ refund: true });
    });

    expect(document.querySelector('#open-closed-all-refund-button')).toBeDisabled();
    // find() returned undefined → fallback {} is passed to isRefundAllowed
    expect(isRefundAllowed).toHaveBeenCalledWith({}, []);
  });

  it('maps selectedAccount to the matching record from feefineshistory and enables refund button', async () => {
    // allAccounts contains the record whose id matches selectedAccount.id
    // find() returns the real account → isRefundAllowed(realAccount) = true → canRefund = true → button enabled
    const existingAccount = {
      id: accountId,
      paymentStatus: { name: 'Paid fully' },
      amount: 100,
      remaining: 0,
      status: { name: 'Closed' },
    };
    isRefundAllowed.mockReturnValue(true);

    renderAccountsListing({
      ...propsWithStatus,
      resources: {
        ...props.resources,
        feefineshistory: { records: [existingAccount] },
      },
    });

    await act(async () => {
      _getCallbacks().onChangeSelected(90, [selectedAccount]);
      _getCallbacks().onChangeActions({ refund: true });
    });

    expect(document.querySelector('#open-closed-all-refund-button')).not.toBeDisabled();
    // Verify isRefundAllowed was called with the real account data (not {})
    expect(isRefundAllowed).toHaveBeenCalledWith(existingAccount, []);
  });
});

import React from 'react';
import { screen } from '@testing-library/react';
import { createMemoryHistory } from 'history';

import '__mock__/stripesCore.mock';
import renderWithRouter from 'helpers/renderWithRouter';
import account from 'fixtures/account';
import openLoans from 'fixtures/openLoans';
import okapiCurrentUser from 'fixtures/okapiCurrentUser';

import AccountDetails from './AccountDetails';

jest.mock('../../components/Accounts/Actions/FeeFineActions', () => () => <></>);

jest.unmock('@folio/stripes/components');

const history = createMemoryHistory();

const props = {
  history,
  location: history.location,
  match: { params: { } },
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

const accountWithLoan = {
  ...account,
  barcode: openLoans[0].item.barcode,
  loanId: openLoans[0].id,
};
const accountWithAnonymizedLoan = {
  ...account,
  barcode: 'b612',
};

const loanResources = {
  ...props.resources,
  loans: {
    records: openLoans,
  }
};

const renderAccountDetails = (extraProps = {}) => renderWithRouter(
  <AccountDetails {...props} {...extraProps} />
);

afterEach(() => jest.clearAllMocks());

describe('Account Details', () => {
  test('without loan', () => {
    renderAccountDetails({ account });
    expect(screen.getByTestId('loan-details')).toHaveTextContent(/-$/);
  });

  test('with loan', () => {
    renderAccountDetails({ account: accountWithLoan, resources: loanResources });
    expect(screen.getByTestId('loan-details')).toHaveTextContent(/ui-users.details.field.loan$/);
  });

  test('with anonymized loan', () => {
    renderAccountDetails({ account: accountWithAnonymizedLoan, resources: loanResources });
    expect(screen.getByTestId('loan-details')).toHaveTextContent(/ui-users.details.label.loanAnonymized$/);
  });
});

describe('Checking Action Menu', () => {
  test('AccountDetail pane should be present', async () => {
    renderAccountDetails({ account });
    expect(document.querySelector('#pane-account-action-history')).toBeInTheDocument();
  });

  test('Pay button should be present', () => {
    renderAccountDetails({ account });
    expect(document.querySelector('#payAccountActionsHistory')).toBeInTheDocument();
  });

  test('Export button should be present', () => {
    renderAccountDetails({ account });
    expect(document.querySelector('#exportAccountActionsHistoryReport')).toBeInTheDocument();
  });
});


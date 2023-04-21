import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryHistory } from 'history';
import '__mock__/stripesCore.mock';
import renderWithRouter from 'helpers/renderWithRouter';
import account from 'fixtures/account';
import openLoans from 'fixtures/openLoans';
import okapiCurrentUser from 'fixtures/okapiCurrentUser';

import AccountDetails from './AccountDetails';

jest.unmock('@folio/stripes/components');
jest.mock('../../components/Accounts/Actions/FeeFineActions', () => (prop) => <div><button type="button" onClick={() => prop.handleEdit()}>handleEdit</button></div>);
jest.mock('../../components/util/isRefundAllowed', () => jest.fn().mockReturnValue(true));

const spyOncalculateSortParams = jest.spyOn(require('../../components/util/util'), 'calculateSortParams');

const spyOnFeeFineReport = jest.spyOn(require('../../components/data/reports/FeeFineReport'), 'default');

const history = createMemoryHistory();
const mockGET = jest.fn();
const props = {
  history,
  location: history.location,
  match: { params: { } },
  isLoading: false,
  resources: {
    feefineshistory: {
      records: [
        {
          paymentStatus: {
            name: 'Suspended claim returned'
          },
          remaining: '10'
        },
        {
          paymentStatus: {
            name: 'Paid'
          },
          remaining: '10'
        }
      ]
    },
    accountActions: {
      records: [
        {
          id: 1,
          dateAction: '21-04-2023',
          accountId: 'b6475706-4505-4b20-9ed0-aadcda2b72ee',
          amountAction: '150',
          balance: '200',
          transactionInformation: 'testtransactionInfo',
          createdAt: 'testZone',
          source: 'testSource',
        },
        {
          id: 2,
          dateAction: '21-04-2023',
          accountId: 'b6475706-4505-4b20-9ed0-aadcda2b72ee',
          amountAction: '100',
          balance: '130',
          transactionInformation: 'testtransactionInfo2',
          createdAt: 'testZone',
          source: 'testSource2',
        }
      ],
      isPending: false
    },
    accounts: {
      isPending: false
    },
    feefineactions: {
      records: [
        {
          dateAction: '21-04-2023',
          accountId: 'b6475706-4505-4b20-9ed0-aadcda2b72dd',
          amountAction: '150',
          balance: '200',
          transactionInformation: 'testtransactionInfo',
          source: 'testSource',
        }
      ],
    },
    loans: {},
    user: {
      update: jest.fn(),
    },
  },
  mutator: {
    activeRecord: {
      update: jest.fn(),
    },
    feefineactions: {
      POST: jest.fn(),
    },
    accountActions: {
      GET: mockGET,
    },
    user: {
      update: jest.fn(),
    },
  },
  num: 42,
  user: { id: '123' },
  patronGroup: { group: 'Shiny happy people' },
  itemDetails: {
    statusItemName: 'No Claim',
    contributors: ['testContributor1', 'testContributor2']
  },
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
const accountWithAdditionalDetails = {
  ...account,
  itemId : 'b2f142bf-ccc4-4cbf-a1ac-7d6df0d9c2da',
  yarholdingsRecordId : 'f318533c-4e67-4130-a765-52e2dcc62e3a',
  instanceId : '63714bc2-52f0-4aa1-8cda-048c4430c481',
  feeFineType: 'testType',
  feeFineOwner: 'testOwner',
  returnedDate: '21-04-2024',
  paymentStatus: {
    name: 'Outstanding'
  }
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


describe('Account Details', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
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

  it('Test for buttons in DropDownMenu', () => {
    renderAccountDetails({ account: accountWithAdditionalDetails });
    userEvent.click(screen.getByRole('button', { name: 'Icon' }));
    userEvent.click(document.getElementById('payAccountActionsHistory'));
    userEvent.click(document.getElementById('waiveAccountActionsHistory'));
    userEvent.click(document.getElementById('refundAccountActionsHistory'));
    userEvent.click(document.getElementById('transferAccountActionsHistory'));
    userEvent.click(document.getElementById('errorAccountActionsHistory'));
    expect(renderAccountDetails({ account: accountWithAdditionalDetails })).toBeTruthy();
  });

  it('FeeFineReport should be called when exportAccountActionsHistoryReport is clicked', () => {
    renderAccountDetails({ account: accountWithAdditionalDetails });
    userEvent.click(document.getElementById('exportAccountActionsHistoryReport'));
    expect(spyOnFeeFineReport).toBeCalled();
  });

  it('calculateSortParams should be called when clicking column headers', () => {
    renderAccountDetails({ account: accountWithAdditionalDetails });
    userEvent.click(screen.getByRole('button', { name: 'ui-users.details.columns.date' }));
    expect(spyOncalculateSortParams).toBeCalledTimes(1);
    userEvent.click(screen.getByRole('button', { name: 'ui-users.details.columns.action' }));
    expect(spyOncalculateSortParams).toBeCalledTimes(2);
    userEvent.click(screen.getByRole('button', { name: 'ui-users.details.columns.amount' }));
    expect(spyOncalculateSortParams).toBeCalledTimes(3);
    userEvent.click(screen.getByRole('button', { name: 'ui-users.details.columns.balance' }));
    expect(spyOncalculateSortParams).toBeCalledTimes(4);
    userEvent.click(screen.getByRole('button', { name: 'ui-users.details.columns.transactioninfo' }));
    expect(spyOncalculateSortParams).toBeCalledTimes(5);
    userEvent.click(screen.getByRole('button', { name: 'ui-users.details.columns.source' }));
    expect(spyOncalculateSortParams).toBeCalledTimes(6);
  });
  it('GET method should be called when the handleEdit button is clicked', () => {
    renderAccountDetails({ account: accountWithAdditionalDetails });
    userEvent.click(screen.getByRole('button', { name: 'handleEdit' }));
    expect(mockGET).toBeCalled();
  });
});

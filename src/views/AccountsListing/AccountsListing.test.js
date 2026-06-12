import React from 'react';
import { createMemoryHistory } from 'history';
import { screen, cleanup } from '@testing-library/react';
import '__mock__';
import '__mock__/stripesSmartComponent.mock';
import '__mock__/stripesCore.mock';
import renderWithRouter from 'helpers/renderWithRouter';
import okapiCurrentUser from 'fixtures/okapiCurrentUser';
import userEvent from '@testing-library/user-event';
import { accounts, account } from 'fixtures/account';
import loans from 'fixtures/openLoans';
import AccountsHistory from './AccountsListing';
import {
  handleFilterChange,
  handleFilterClear,
} from '../../components/Accounts/accountFunctions';

const toggleDropdownState = true;
const newActions = {
  cancellation: true,
  pay: true,
  regular: true,
  regularpayment: true,
  waive: true,
  waiveModal: true,
  waiveMany: true,
  transferModal: true,
  transferMany: true,
  transfer: true,
  refund: true,
  refundModal: true,
  refundMany: true,
};

const accountsData = [
  {
    id: 'acountid1',
    amount: 5,
    barcode: 'testCode',
    callNumber: '11223322',
    dueDate: '2023-04-06T04:52:19.214+00:00',
    feeFineOwner: 'TestOwner',
    feeFineType: 'Test Feefine type',
    loanId: 1,
    loan: 'Loan1',
    metadata: {
      createdDate: '2022-01-06T04:52:19.214+00:00',
      updatedDate: '2023-11-12T04:52:19.214+00:00',
    },
    paymentStatus: { name: 'Outstanding' },
    remaining: 5,
    returnedDate: '2023-04-06T04:52:19.214+00:00',
    rowIndex: 0,
    status: {
      name: 'all'
    },
    filter: {
      records: []
    },
    title: 'Test Title',
  }
];

jest.unmock('@folio/stripes/components');
jest.mock('../../components/Accounts/Actions/FeeFineActions', () => (prop) => <div> <button type="button" onClick={() => prop.handleEdit()}>handleEdit</button>, <button type="button" onClick={() => prop.onChangeSelectedAccounts(accountsData)}>onChangeSelectedAccounts</button>, <button type="button" onClick={() => prop.onChangeActions(newActions, toggleDropdownState)}>onChangeActions</button></div>);
jest.mock('../../components/Accounts/Filters/Filters', () => (prop) => <div> <button type="button" onClick={() => prop.toggle(toggleDropdownState)}>toggleFilterPane</button>, <button type="button" onClick={() => prop.onChangeFilter()}>onChangeFilter</button>, <button type="button" onClick={() => prop.onClearFilters()}>onClearFilters</button>, <button type="button" onClick={() => prop.onClearSearch()}>onClearSearch</button>, <button type="button" onClick={() => prop.onChangeSearch()}>onChangeSearch</button></div>);
jest.mock('../../components/Accounts/ViewFeesFines/ViewFeesFines', () => (prop) => <div> <button type="button" onClick={() => prop.onChangeSelected()}>onChangeSelected</button></div>);
jest.mock('../../components/Accounts/accountFunctions', () => ({
  ...jest.requireActual('../../components/Accounts/accountFunctions'),
  handleFilterChange: jest.fn(),
  handleFilterClear: jest.fn()
}));

jest.mock('../../components/util/isRefundAllowed', () => jest.fn().mockReturnValue(true));
jest.mock('../../components/data/reports/FeeFineReport', () => () => <></>);

const history = createMemoryHistory();

const props = {
  history,
  intl: { formatMessage: jest.fn() },
  loans: [{}],
  update: jest.fn(),
  openAccounts: true,
  location: history.location,
  match: { params: { id: '123', accountstatus: 'all' } },
  isLoading: true,
  resources: {
    feefineshistory: {
      records: [
        {
          id: 'testId1',
          name: 'testName',
          loanId: '123',
          status: {
            name: 'all'
          },
          paymentStatus: {
            name: 'Suspended claim returned'
          },
        },
        {
          id: 'testId2',
          name: 'testName2',
          loanId: '234',
          status: {
            name: 'open'
          },
          paymentStatus: {
            name: 'yes'
          }
        }
      ]
    },
    comments: {
      records: [{ name: 'all' }, { name: 'open' }]
    },
    query: { filter: {} },
    accountActions: {},
    accounts: {},
    feefineactions: {},
    loans: { records: [{ name: 'all' }] },
    user: {
      update: jest.fn(),
    },
    servicePoints: {},
    filter: {
      records: [
        {
          userId: '123',
          feeFineType: {
            name: 'feeFineType1'
          },
          feeFineOwner: {
            name: 'feeFineOwner1'
          },
          paymentStatus: {
            name: 'Suspended claim returned'
          },
          materialType: {
            name: 'word'
          }
        },
        {
          feeFineType: 'feeFineType2',
          feeFineOwner: 'feeFineOwner2',
          paymentStatus: {
            name: 'failed'
          },
          materialType: 'word'
        },
      ]
    }
  },
  mutator: {
    query: {
      update: jest.fn()
    },
    activeRecord: { update: jest.fn() },
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
  user: okapiCurrentUser,
  parentMutator: {
    query: {},
  },
  currentUser: {},
  patronGroup: { group: 'Shiny happy people' },
  itemDetails: {},
  stripes: {
    hasPerm: jest.fn().mockReturnValue(true),
    connect: (Component) => Component,
  },
  account,
  owedAmount: 45.67,
  okapi: {
    url: 'https://localhost:9130',
    tenant: 'diku',
    okapiReady: true,
    authFailure: [],
    bindings: {},
    currentUser: okapiCurrentUser,
  },
  filter: { id: '111' },
};

const renderAccountsListing = (extraProps = {}) => renderWithRouter(
  <AccountsHistory {...props} {...extraProps} />
);

afterEach(() => jest.clearAllMocks());

describe('Checking Action Menu', () => {
  afterEach(cleanup);
  test('AccountListing pane should be present', async () => {
    renderAccountsListing({ account });
    expect(document.querySelector('#pane-account-listing')).toBeInTheDocument();
  });

  test('Should Click on Icon button', () => {
    renderAccountsListing({ account });
    const Iconbutton = screen.getByRole('button', { name: 'Icon' });
    userEvent.click(Iconbutton);
    expect(Iconbutton).toBeTruthy();
  });

  test('Should Click on handleEdit button', () => {
    renderAccountsListing({ account });
    userEvent.click(screen.getByRole('button', { name: 'handleEdit' }));
    expect(screen.getByRole('button', { name: 'handleEdit' })).toBeTruthy();
  });

  test('Should Click on onChangeActions button', () => {
    renderAccountsListing({ account });
    userEvent.click(screen.getByRole('button', { name: 'onChangeActions' }));
    expect(screen.getByRole('button', { name: 'onChangeActions' })).toBeTruthy();
  });

  test('handleFilterChange to called on clicking onChangeFilter', () => {
    renderAccountsListing({ account });
    userEvent.click(screen.getByRole('button', { name: 'onChangeFilter' }));
    expect(handleFilterChange).toBeCalled();
  });

  test('Should Click on toggleFilterPane button', () => {
    renderAccountsListing({ account });
    const toggleFilterPane = screen.getByRole('button', { name: 'toggleFilterPane' });
    userEvent.click(toggleFilterPane);
    expect(toggleFilterPane).toBeInTheDocument();
  });

  test('handleFilterClear to called on clicking  onClearFilters', () => {
    renderAccountsListing({ account });
    const onClearFilters = screen.getByRole('button', { name: 'onClearFilters' });
    userEvent.click(onClearFilters);
    expect(handleFilterClear).toBeCalled();
  });

  test('Should Click on onClearSearch button', () => {
    renderAccountsListing({ account });
    const onClearSearch = screen.getByRole('button', { name: 'onClearSearch' });
    userEvent.click(onClearSearch);
    expect(onClearSearch).toBeTruthy();
  });

  test('Should Click on onChangeSelected button', () => {
    renderAccountsListing({ account });
    const onChangeSelected = screen.getByRole('button', { name: 'onChangeSelected' });
    userEvent.click(onChangeSelected);
    expect(onChangeSelected).toBeTruthy();
  });
  test('Should Click on onChangeSelectedAccounts button', () => {
    renderAccountsListing({ account });
    const onChangeSelectedAccounts = screen.getByRole('button', { name: 'onChangeSelectedAccounts' });
    userEvent.click(onChangeSelectedAccounts);
    expect(onChangeSelectedAccounts).toBeTruthy();
  });
  test('open-closed-all-charge-button should be present', () => {
    renderAccountsListing({ account });
    userEvent.click(document.querySelector('#open-closed-all-charge-button'));
    expect(document.querySelector('#open-closed-all-charge-button')).toBeInTheDocument();
  });

  test('Pay button should be present', () => {
    renderAccountsListing({ account });
    userEvent.click(document.querySelector('#open-closed-all-pay-button'));
    expect(document.querySelector('#open-closed-all-pay-button')).toBeInTheDocument();
  });

  test('Section show columns should be present', () => {
    renderAccountsListing({ account });
    expect(document.querySelector('#sectionShowColumns')).toBeInTheDocument();
  });

  test('Click on closeItem button', () => {
    renderAccountsListing({ account });
    userEvent.click(document.querySelector('[aria-label="stripes-components.closeItem"]'));
    expect(document.querySelector('[aria-label="stripes-components.closeItem"]')).toBeInTheDocument();
  });

  test('actionMenuToggle button clicking', () => {
    renderAccountsListing({ account });
    userEvent.click(document.querySelector('[class="button primary marginBottom0 actionMenuToggle"]'));
    expect(document.querySelector('[class="button primary marginBottom0 actionMenuToggle"]')).toBeInTheDocument();
  });

  test('open-closed-all-wave-button Clicking', () => {
    renderAccountsListing({ account });
    userEvent.click(document.querySelector('#open-closed-all-wave-button'));
    expect(document.querySelector('#open-closed-all-wave-button')).toBeInTheDocument();
  });

  test('open-closed-all-refund-button Clicking', () => {
    renderAccountsListing({ account });
    userEvent.click(document.querySelector('#open-closed-all-refund-button'));
    expect(document.querySelector('#open-closed-all-refund-button')).toBeInTheDocument();
  });

  test('open-closed-all-transfer-button Clicking', () => {
    renderAccountsListing({ account });
    userEvent.click(document.querySelector('#open-closed-all-transfer-button'));
    expect(document.querySelector('#open-closed-all-transfer-button')).toBeInTheDocument();
  });

  test('fee-fine-report-export-button Clicking', () => {
    renderAccountsListing({ account });
    userEvent.click(document.querySelector('#fee-fine-report-export-button'));
    expect(document.querySelector('#fee-fine-report-export-button')).toBeInTheDocument();
  });

  test('accounts.open button Clicking', () => {
    renderAccountsListing({ account });
    userEvent.click(document.querySelector('#open-accounts'));
    expect(document.querySelector('[id="outstanding-balance"]')).toBeInTheDocument();
  });

  test('accounts.closed button Clicking', () => {
    renderAccountsListing({ account });
    userEvent.click(document.querySelector('#closed-accounts'));
    expect(document.querySelector('#closed-accounts')).toBeInTheDocument();
  });

  test('accounts.all button Clicking', () => {
    renderAccountsListing({ account });
    userEvent.click(document.querySelector('#all-accounts'));
    expect(screen.getByText('ui-users.accounts.history.statusLabel')).toBeInTheDocument();
    expect(screen.getByText('(Shiny happy people)')).toBeInTheDocument();
  });

  test('Should click on ui-users.accounts.history.columns.updated button', () => {
    renderAccountsListing({ account });
    const accountshistorycolumnsupdated = (document.querySelector('[id="ui-users.accounts.history.columns.updated"]'));
    userEvent.click(accountshistorycolumnsupdated);
    expect(accountshistorycolumnsupdated).toBeTruthy();
  });

  test('Should Enable buttons actions', () => {
    renderAccountsListing({ account });

    userEvent.click(screen.getByRole('button', { name: 'onChangeActions' }));
    expect(screen.getByRole('button', { name: 'onChangeActions' })).toBeTruthy();

    const onChangeSelected = screen.getByRole('button', { name: 'onChangeSelected' });
    userEvent.click(onChangeSelected);
    expect(onChangeSelected).toBeTruthy();

    const onChangeSelectedAccounts = screen.getByRole('button', { name: 'onChangeSelectedAccounts' });
    userEvent.click(onChangeSelectedAccounts);
    expect(onChangeSelectedAccounts).toBeTruthy();

    userEvent.click(document.querySelector('#open-closed-all-pay-button'));
    expect(document.querySelector('#open-closed-all-pay-button')).toBeInTheDocument();
    userEvent.click(document.querySelector('#open-closed-all-wave-button'));
    expect(document.querySelector('#open-closed-all-wave-button')).toBeInTheDocument();
    userEvent.click(document.querySelector('#open-closed-all-refund-button'));
    expect(document.querySelector('#open-closed-all-refund-button')).toBeInTheDocument();
    userEvent.click(document.querySelector('#open-closed-all-transfer-button'));
    expect(document.querySelector('#open-closed-all-transfer-button')).toBeInTheDocument();
  });
});

describe('Should Rerender component', () => {
  const resources = {
    loansHistory: {
      records: loans,
    },
    feefineactions: {
      records: [{
        typeAction: 'Refunded fully'
      }],
    },
  };

  const resourcesEmpty = {
    loansHistory: {
      records: [],
    },
    feefineactions: {
      records: [],
    },
  };

  const props2 = {
    user: {},
    patronGroup: { group: '' },
    openAccounts: false,
    match: { params: { id: '', accountstatus: 'open' } },
    location: {
      search: 'test',
      path: '/userAccounts'
    },
    resources: accounts ? resources : resourcesEmpty,
  };
  const props3 = {
    resources: {
      feefineshistory: {
        records: [
          {
            id: 'testId3',
            name: 'testName3',
            loanId: '234',
            status: {
              name: 'open'
            },
            paymentStatus: {
              name: 'Suspended claim returned1'
            },
          },
        ]
      },
      comments: {
        records: [{}]
      },
      query: { filter: {} },
      accountActions: {},
      accounts: {},
      feefineactions: {},
      loans: { records: [{}] },
      user: {
        update: jest.fn(),
      },
      servicePoints: {},
      filter: {
        records: [
          {
            userId: '234',
            feeFineType: {
              name: 'feeFineType4'
            },
            paymentStatus: {
              name: 'Suspended claim returned4'
            },
            materialType: {
              name: 'word4'
            }
          }
        ]
      }
    },
    user: {},
    patronGroup: { group: 'Closed' },
    openAccounts: false,
    match: { params: { id: '', accountstatus: 'closed' } },
    location: {
      search: 'test',
      path: '/userAccounts'
    },
  };
  test('Rerender patronGroup and changing accountstatus to open', () => {
    renderAccountsListing(props2);
    const onChangeActions = screen.getByRole('button', { name: 'onChangeActions' });
    userEvent.click(onChangeActions);
    expect(screen.getByRole('link', { name: '()' })).toBeInTheDocument();
  });

  test('changing accountstatus props to Closed', () => {
    renderAccountsListing(props3);
    const onChangeActions = screen.getByRole('button', { name: 'onChangeActions' });
    userEvent.click(onChangeActions);
    expect(screen.getByRole('link', { name: '(Closed)' })).toBeInTheDocument();
  });
});

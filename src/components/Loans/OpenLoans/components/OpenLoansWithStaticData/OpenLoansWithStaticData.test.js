import okapiCurrentUser from 'fixtures/okapiCurrentUser';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import renderWithRouter from 'helpers/renderWithRouter';
import loans from 'fixtures/openLoans';
import OpenLoansWithStaticData from './OpenLoansWithStaticData';

jest.unmock('@folio/stripes/components');
jest.unmock('@folio/stripes/util');

const mockToggleColumn = jest.fn();
const showChangeDueDateDialogMock = jest.fn();
const toCsvMock = jest.fn();

const renderOpenLoansWithStaticData = (props) => renderWithRouter(<OpenLoansWithStaticData {...props} />);
const STRIPES = {
  connect: (Component) => Component,
  config: {},
  currency: 'USD',
  hasInterface: () => true,
  hasPerm: jest.fn(),
  clone: jest.fn(),
  setToken: jest.fn(),
  setTimezone: jest.fn(),
  setCurrency: jest.fn(),
  setSinglePlugin: jest.fn(),
  setBindings: jest.fn(),
  locale: 'en-US',
  actionNames: ['stripesHome', 'usersSortByName'],
  setLocale: jest.fn(),
  logger: {
    log: jest.fn(),
  },
  okapi: {
    tenant: 'diku',
    url: 'https://folio-testing-okapi.dev.folio.org',
  },
  store: {
    getState: () => ({
      okapi: {
        token: 'abc',
      },
    }),
    dispatch: jest.fn(),
    subscribe: jest.fn(),
    replaceReducer: jest.fn(),
  },
  timezone: 'UTC',
  user: {
    perms: {},
    user: {
      id: 'b1add99d-530b-5912-94f3-4091b4d87e2c',
      username: 'diku_admin',
    },
  },
  withOkapi: true,
};

const checkedLoans = {
  '40f5e9d9-38ac-458e-ade7-7795bd821652': {
    action: 'checkedout',
    borrower: { firstName: 'Justen', lastName: 'Hilll', middleName: 'Else', barcode: '344058867767195' },
    dueDate: '2017-03-19T18:32:31.000+00:00',
    feesAndFines: { amountRemainingToPay: 0 },
    id: '40f5e9d9-38ac-458e-ade7-7795bd821652',
    item: {
      id: '1b6d3338-186e-4e35-9e75-1b886b0da53e',
      holdingsRecordId: '65cb2bf0-d4c2-4886-8ad0-b76f1ba75d61',
      instanceId: '7fbd5d84-62d1-44c6-9c45-6cb173998bbd',
      title: 'Bridget Jones the diaries',
      barcode: '453987605438',
      callNumber: 'PR6056.I4588 B749 2016',
      callNumberComponents: { callNumber: 'PR6056.I4588 B749 2016' },
      copyNumber: 'Copy 1',
      materialType: { name: 'book' },
      status: { name: 'Checked out', date: '2021-12-09T03:24:15.516+00:00' },
      contributors: [{ name: 'Fielding, Helen' }],
    },
    itemId: '1b6d3338-186e-4e35-9e75-1b886b0da53e',
    loanDate: '2017-03-05T18:32:31Z',
    loanPolicy: { name: 'testPolicy' },
    lostItemPolicy: { name: null },
    metadata: { createdDate: '2021-12-09T03:24:20.123+00:00', updatedDate: '2021-12-09T03:24:20.123+00:00' },
    overdueFinePolicy: { name: null },
    renewalCount: 0,
    rowIndex: 0,
    status: { name: 'Open' },
    userId: '47f7eaea-1a18-4058-907c-62b7d095c61b',
  }
};

const props = {
  user: okapiCurrentUser,
  stripes: STRIPES,
  intl: { formatMessage: () => {} },
  activeLoan: '40f5e9d9-38ac-458e-ade7-7795bd821652',
  loans,
  patronBlocks: [],
  requestRecords: [],
  visibleColumns: [{
    status: true,
    title: 'Contributors'
  }],
  possibleColumns: [],
  resources: {
    activeRecord: { user: 'ab579dc3-219b-4f5b-8068-ab1c7a55c402' },
    loanAccount: { records: [] },
  },
  patronGroup: {},
  checkedLoans,
  requestCounts: {},
  allChecked: false,
  patronBlockedModal: false,
  changeDueDateDialogOpen: true,
  toggleAll: jest.fn(),
  toggleItem: jest.fn(),
  buildRecords: toCsvMock,
  toggleColumn: mockToggleColumn,
  renewSelected: jest.fn(),
  isLoanChecked: jest.fn(),
  getLoanPolicy: jest.fn(),
  handleOptionsChange: jest.fn(),
  openPatronBlockedModal: jest.fn(),
  showChangeDueDateDialog: showChangeDueDateDialogMock,
  hideChangeDueDateDialog: jest.fn(),
  onClosePatronBlockedModal: jest.fn(),
  feeFineCount: jest.fn(),
  history: {},
  location: {
    pathname: '/users/aac21169-1bed-4e74-bbbf-074273098770/loans/open'
  },
  match: {
    path: '/users/:id/loans/:loanstatus',
    params: {
      id: 'a51df26e-b472-5c06-8362-01025b90238b',
      loanstatus: 'open',
    }
  }
};

describe('OpenLoansWithStatic Data component', () => {
  it('Component must be rendered', () => {
    renderOpenLoansWithStaticData(props);
    expect(screen.getByText('ui-users.loans.claimReturned')).toBeInTheDocument();
    expect(screen.getByText('stripes-smart-components.cddd.changeDueDate')).toBeInTheDocument();
    expect(screen.getByText('stripes-components.exportToCsv')).toBeInTheDocument();
  });
  it('Bulk Claim modal must be rendered', () => {
    renderOpenLoansWithStaticData(props);
    userEvent.click(screen.getByText('ui-users.loans.claimReturned'));
    userEvent.click(screen.getByText('ui-users.cancel'));
    expect(screen.getByText('ui-users.bulkClaimReturned.summary')).toBeInTheDocument();
    expect(screen.getByText('testPolicy')).toBeInTheDocument();
    expect(screen.getByText('453987605438')).toBeInTheDocument();
  });
  it('Change Due Date modal must be rendered', () => {
    renderOpenLoansWithStaticData(props);
    userEvent.click(screen.getByText('stripes-smart-components.cddd.changeDueDate'));
    expect(showChangeDueDateDialogMock).toHaveBeenCalled();
  });
  it('To Csv must be rendered', () => {
    renderOpenLoansWithStaticData(props);
    userEvent.click(screen.getByText('stripes-components.exportToCsv'));
    expect(toCsvMock).toHaveBeenCalled();
  });
  it('Column visibility filter check', () => {
    renderOpenLoansWithStaticData(props);
    userEvent.click(document.querySelector('[id="columnsDropdown"]'));
    userEvent.click(document.querySelector('[id="ui-users.loans.columns.contributors"]'));
    expect(mockToggleColumn).toHaveBeenCalled();
  });
});

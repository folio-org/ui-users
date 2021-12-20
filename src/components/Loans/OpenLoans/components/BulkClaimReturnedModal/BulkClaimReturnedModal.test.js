import okapiCurrentUser from 'fixtures/okapiCurrentUser';

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import renderWithRouter from 'helpers/renderWithRouter';
import BulkClaimReturnedModal from './BulkClaimReturnedModal';

import '__mock__/stripesCore.mock';
import '__mock__/stripesSmartComponent.mock';

jest.unmock('@folio/stripes/components');

const renderBulkClaimReturnedModal = (props) => renderWithRouter(<BulkClaimReturnedModal {...props} />);

const STRIPES = {
  connect: (Component) => Component,
  config: {},
  currency: 'USD',
  hasInterface: () => true,
  hasPerm: jest.fn().mockReturnValue(true),
  clone: jest.fn(),
  setToken: jest.fn(),
  locale: 'en-US',
  logger: {
    log: () => {},
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
    dispatch: () => {},
    subscribe: () => {},
    replaceReducer: () => {},
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
      title: "Bridget Jones's Baby: the diaries",
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

const mutator = {
  claimReturned: {
    POST: () => new Promise((resolve, _) => { resolve({ ok: true }); }),
  },
  accounts: {
    GET: jest.fn(),
    PUT: jest.fn(),
  },
  feefineactions: {
    GET: jest.fn(),
    POST: jest.fn(),
  },
  loanId: {
    replace: jest.fn(),
  },
  activeAccount: {
    GET: jest.fn(),
    POST: jest.fn(),
  },
};

const mutatorFailed = {
  claimReturned: {
    POST: () => new Promise((resolve, _) => {
      resolve({ ok: false,
        url: 'http://abc.com/40f5e9d9-38ac-458e-ade7-7795bd821652/claim-item-returned',
        id: '40f5e9d9-38ac-458e-ade7-7795bd821652' });
    }),
  },
  accounts: {
    GET: jest.fn(),
    PUT: jest.fn(),
  },
  feefineactions: {
    GET: jest.fn(),
    POST: jest.fn(),
  },
  loanId: {
    replace: jest.fn(),
  },
  activeAccount: {
    GET: jest.fn(),
    POST: jest.fn(),
  },
};


describe('BulkClaimReturnedModal component', () => {
  it('Checking BulkClaimReturnedModal Modal checked Loan data', () => {
    const props = {
      requestCounts: {
        '1b6d3338-186e-4e35-9e75-1b886b0da53e' : 10,
      },
      stripes: STRIPES,
      intl: {},
      open: true,
      onCancel: jest.fn(),
      okapi: {
        currentUser: okapiCurrentUser,
      },
      checkedLoansIndex: checkedLoans,
      mutator,
    };
    expect(renderBulkClaimReturnedModal(props)).toBeTruthy();

    // Checking Confirmation dialog
    userEvent.type(document.querySelector('[data-test-bulk-claim-returned-additional-info="true"]'), 'test');
    userEvent.click(document.querySelector('[data-test-bulk-cr-confirm-button="true"]'));

    // checking loan data
    expect(screen.getByText('PR6056.I4588 B749 2016')).toBeTruthy();
  });
  it('Checking BulkClaimReturnedModal Modal for uncheckedLoans data', () => {
    const props = {
      requestCounts: {},
      stripes: STRIPES,
      intl: {},
      open: true,
      onCancel: jest.fn(),
      okapi: {
        currentUser: okapiCurrentUser,
      },
      checkedLoansIndex: checkedLoans,
      mutator: mutatorFailed,
    };
    renderBulkClaimReturnedModal(props);

    // Additional information confirmation box must be displayed
    expect(screen.getByText('ui-users.additionalInfo.label')).toBeTruthy();
    userEvent.type(document.querySelector('[data-test-bulk-claim-returned-additional-info="true"]'), 'test');
    userEvent.click(document.querySelector('[data-test-bulk-cr-confirm-button="true"]'));

    // Only checked loans must be provided
    expect(screen.getByText('453987605438')).toBeTruthy();

    // Covering cancel button function
    userEvent.click(document.querySelector('[data-test-bulk-cr-cancel-button="true"]'));
  });
  it('Checking BulkClaimReturnedModal Modal for empty loans', () => {
    const props = {
      requestCounts: {},
      stripes: STRIPES,
      intl: {},
      open: true,
      onCancel: jest.fn(),
      okapi: {
        currentUser: okapiCurrentUser,
      },
      mutator: mutatorFailed,
      checkedLoansIndex: {},
    };
    renderBulkClaimReturnedModal(props);
    // Preconfirm model must be returned
    expect(screen.getByText('ui-users.bulkClaimReturned.preConfirm')).toBeTruthy();
  });
});

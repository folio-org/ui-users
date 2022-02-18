import okapiCurrentUser from 'fixtures/okapiCurrentUser';

import renderWithRouter from 'helpers/renderWithRouter';
import Modals from './Modals';

import '__mock__/stripesCore.mock';
import '__mock__/stripesSmartComponent.mock';

jest.unmock('@folio/stripes/components');

const renderModals = (props) => renderWithRouter(<Modals {...props} />);
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

const loans = [
  {
    action: 'recallrequested',
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
      contributors: [
        {
          name: 'Fielding, Helen',
        }],
      copyNumber: 'Copy 1',
      location: { name: 'Main Library' },
      materialType: { name: 'book' },
      status: { name: 'Aged to lost', date: '2021-10-14T03:22:56.490+00:00' },
    },
    itemId: '1b6d3338-186e-4e35-9e75-1b886b0da53e',
    loanDate: '2017-03-05T18:32:31Z',
    loanPolicy: { name: null },
    lostItemPolicy: { name: 'test' },
    lostItemPolicyId: 'test123',
    metadata: { createdDate: '2021-10-14T03:23:01.455+00:00', updatedDate: '2021-10-14T03:23:01.455+00:00' },
    overdueFinePolicy: { name: 'test' },
    overdueFinePolicyId: 'test345',
    renewalCount: 0,
    status: { name: 'Open' },
    userId: '61d2fa07-437c-4805-9332-05ecd11c3e30',
    agedToLostDelayedBilling: {
      lostItemHasBeenBilled : '',
      dateLostItemShouldBeBilled : '',
    },
  }
];


describe('UserPermissions component', () => {
  it('Change duedate and patron block modal must be rendered', () => {
    const props = {
      user: okapiCurrentUser,
      onBulkClaimReturnedCancel: jest.fn(),
      showBulkClaimReturnedModal: false,
      renewSelected: jest.fn(),
      openPatronBlockedModal: jest.fn(),
      onClosePatronBlockedModal: jest.fn(),
      changeDueDateDialogOpen: true,
      hideChangeDueDateDialog: jest.fn(),
      patronBlockedModal: true,
      loans,
      activeLoan: '40f5e9d9-38ac-458e-ade7-7795bd821652',
      patronGroup: {},
      checkedLoans: {},
      patronBlocks: [],
      requestCounts: {},
      stripes: STRIPES,
      intl: {},
    };
    renderModals(props);
    expect(document.querySelector('[ data-testid="change-duedate-dialog"]')).toBeTruthy();
    expect(document.querySelector('[data-test-patron-block-modal="true"]')).toBeTruthy();
  });
  it('Bulk Claim modal must be rendered', () => {
    const props = {
      user: okapiCurrentUser,
      onBulkClaimReturnedCancel: jest.fn(),
      showBulkClaimReturnedModal: true,
      renewSelected: jest.fn(),
      openPatronBlockedModal: jest.fn(),
      onClosePatronBlockedModal: jest.fn(),
      changeDueDateDialogOpen: false,
      hideChangeDueDateDialog: jest.fn(),
      patronBlockedModal: false,
      loans,
      activeLoan: '',
      patronGroup: {},
      checkedLoans: { id: '40f5e9d9-38ac-458e-ade7-7795bd821652' },
      patronBlocks: [],
      requestCounts: {},
      stripes: STRIPES,
      intl: {},
    };
    renderModals(props);
    expect(document.querySelector('[data-test-bulk-claim-returned-additional-info="true"]')).toBeTruthy();
  });
});

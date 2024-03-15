// eslint-disable-next-line import/no-extraneous-dependencies
import { screen, within } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';
// eslint-disable-next-line import/no-extraneous-dependencies
import okapiOpenLoan from 'fixtures/openLoan';
import okapiCurrentUser from 'fixtures/okapiCurrentUser';
import renderWithRouter from 'helpers/renderWithRouter';
import LoanDetails from './LoanDetails';
import {
  DCB_INSTANCE_ID,
  DCB_HOLDINGS_RECORD_ID,
} from '../../constants';


jest.useFakeTimers('legacy');
jest.mock('react-intl', () => ({
  ...jest.requireActual('react-intl'),
  formatMessage: jest.fn().mockImplementation(() => 'Format'),
  formatTime: jest
    .fn()
    .mockImplementation(() => 'Fri Jun 17 2022 11:27:28 GMT+0100'),
}));
const mockAccounts = jest.fn().mockImplementation(() => {
  return true;
});
jest.spyOn(console, 'warn').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});
jest.mock('../../components/util', () => ({
  ...jest.requireActual('../../components/util'),
  accountsMatchStatus: (item1, item2) => mockAccounts(item1, item2),
}));
jest.mock('@folio/stripes/components', () => ({
  ...jest.requireActual('@folio/stripes/components'),
  Modal: jest
    .fn()
    .mockImplementation((dismissible, closeOnBackgroundClick, onClose) => {
      return (
        <>
          <div>Dismiss Modal </div>
          <button type="button" id="clickable-cancel" onClick={onClose}>
            Close Modal
          </button>
        </>
      );
    }),
}));
jest.mock('@folio/stripes/smart-components', () => ({
  ChangeDueDateDialog: jest
    .fn()
    .mockImplementation((stripes, loanIds, onClose) => {
      return (
        <>
          <div>Patron Modal </div>
          <button type="button" id="clickable-cancel" onClick={onClose}>
            Close Button
          </button>
        </>
      );
    }),
}));
jest.mock('@folio/stripes/util', () => ({
  effectiveCallNumber: jest.fn().mockReturnValue(3),
}));
const mockGetLodash = jest.fn().mockImplementation(() => {
  return 'Lost and paid';
});
const mockIsEmpty = jest.fn().mockImplementation(() => false);

const STRIPES = {
  connect: (Component) => Component,
  config: {},
  actionNames: [],
  setBindings: jest.fn(),
  setCurrency: jest.fn(),
  setLocale: jest.fn(),
  setSinglePlugin: jest.fn(),
  setTimezone: jest.fn(),
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

const mockGet = jest.fn(() => new Promise((resolve, _) => resolve([{}])));
const mockPost = jest.fn(
  (record) => new Promise((resolve, _) => resolve(record))
);
const mockReset = jest.fn(() => new Promise((resolve, _) => resolve()));
const declareLostMock = jest.fn();
const renewMock = jest.fn();
const claimReturnedMock = jest.fn();
const markAsMissingMock = jest.fn();

jest.mock(
  '../../components/PatronBlock/PatronBlockModalWithOverrideModal',
  () => {
    // eslint-disable-next-line func-names
    return function (props) {
      return (
        <>
          <div>Patron Modal </div>
          <button
            type="button"
            id="clickable-cancel"
            onClick={props.onClosePatronBlockedModal}
          >
            Cancel Form
          </button>
          <button type="button" id="clickable-cancel" onClick={props.onRenew}>
            Reset Form
          </button>
          <button
            type="button"
            id="clickable-save"
            onClick={props.onOpenPatronBlockedModal}
          >
            Submit Form
          </button>
        </>
      );
    };
  }
);

const propsData = {
  intl: {
    formatTime: jest.fn().mockImplementation(() => new Date()),
    formatMessage: jest.fn().mockImplementation(() => 'format message'),
  },
  stripes: STRIPES,

  showErrorCallout: jest.fn(),
  loan: okapiOpenLoan,
  mutator: {
    query: {},
    accounts: {
      GET: jest.fn(),
      PUT: jest.fn(),
    },
    activeLoanStorage: { GET: mockGet, PUT: jest.fn() },
    activeAccount: { GET: mockGet, PUT: jest.fn() },
    loanstorage: { GET: mockGet, PUT: jest.fn() },
    activeRecord: {
      update: jest.fn(),
    },
    loanPolicies: {
      GET: mockGet,
      reset: mockReset,
    },
    renew: {
      POST: mockPost,
    },
    requests: {
      GET: mockGet,
      replace: jest.fn(),
      reset: mockReset,
    },
  },
  loanActionsWithUser: [
    {
      action: 'User Call',
      filter: 'itemAgedToLost',
      metadata: {
        updatedDate: '2023-05-01'
      }
    }
  ],
  loanAccountActions: [{}],
  resources: {
    activeRecord: {
      user: 'ab579dc3-219b-4f5b-8068-ab1c7a55c402',
    },
    loanAccount: {
      records: [],
      resource: 'loanAccount',
    },
    loanPolicies: {
      records: [],
      resource: 'loanPolicies',
    },
    loansHistory: {
      records: [],
      resource: 'loansHistory',
    },
    patronGroups: {
      resource: 'patronGroups',
      records: [
        {
          desc: 'Staff Member',
          expirationOffsetInDays: 730,
          group: 'staff',
          id: '3684a786-6671-4268-8ed0-9db82ebca60b',
        },
      ],
    },
    query: {
      query: '',
    },
  },
  okapi: {
    okapiReady: true,
    currentUser: okapiCurrentUser,
    token:
      'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJkaWt1X2FkbWluIiwidHlwZSI6ImxlZ2FjeS1hY2Nlc3MiLCJ1c2VyX2lkIjoiMzJiMDZlODItODAzZC01ZDFjLWE5OTgtZjA5ZThkMDUwZWEyIiwiaWF0IjoxNjU3NTI1NDExLCJ0ZW5hbnQiOiJkaWt1In0.Nv2ZD1wcIDDACCistRPSOnvJ1cfmVIBt9KMxCiNlXEA',
    url: 'https://folio-snapshot-okapi.dev.folio.org',
  },
  user: {
    id: 'ab579dc3-219b-4f5b-8068-ab1c7a55c402',
    patronGroup: '503a81cd-6c26-400f-b620-14c08943697c',
    type: 'patron',
    expirationDate: null,
    active: true,
    updatedDate: '2022-07-11T01:52:01.961+00:00',
    username: 'delpha2',
    barcode: '508444097915063',
    departments: [],
  },
  history: { push: jest.fn() },
  location: {},
  match: { params: { accountid: 1 } },
  patronGroup: {
    desc: 'Faculty Member',
    expirationOffsetInDays: 365,
    group: 'faculty',
    id: '503a81cd-6c26-400f-b620-14c08943697c',
  },
  requestCounts: {},
  loanPolicies: {
    '985fd5a1-3634-4b0d-8c13-0d4fcf0b8afa': '3 day',
  },
  patronBlocks: [],
  renew: renewMock,
  declareLost: declareLostMock,
  claimReturned: claimReturnedMock,
  markAsMissing: markAsMissingMock,
};

const renderLoanProxyDetails = (props1) => renderWithRouter(<LoanDetails {...props1} />);

describe('LoanDetails', () => {
  describe('Render LoanProxyDetails component', () => {
    it('When props ID and proxy ID are same with Loan Missing', () => {
      mockGetLodash.mockReset();
      mockGetLodash.mockImplementation(() => {
        return 'Lost and paid';
      });
      renderLoanProxyDetails({
        ...propsData,
        loanIsMissing: true,
      });
      expect(screen.getAllByText('ui-users.loan404')).toBeTruthy();
    });
    it('When props ID and proxy ID are same', () => {
      mockGetLodash.mockReset();
      mockGetLodash.mockImplementation(() => {
        return 'Lost and paid';
      });

      const { getByText } = renderLoanProxyDetails({
        ...propsData,
        loanIsMissing: false,
      });
      userEvent.click(getByText('stripes-smart-components.cddd.changeDueDate'));
      userEvent.click(getByText('ui-users.renew'));
      userEvent.click(getByText('ui-users.loans.claimReturned'));
      expect(screen.getAllByText('ui-users.loans.claimReturned')).toBeTruthy();
    });
    it('When props ID and proxy ID are same with data', () => {
      mockGetLodash.mockReset();
      mockGetLodash.mockImplementation(() => {
        return '';
      });
      renderLoanProxyDetails({
        ...propsData,
        loanIsMissing: false,
      });
      expect(screen.getAllByText('ui-users.loans.claimReturned')).toBeTruthy();
    });
    it.skip('When props ID and proxy ID are same with claims', () => {
      mockGetLodash.mockReset();
      mockGetLodash.mockImplementation((item, item2) => {
        return item2.includes('contributors') ? undefined : 'Claimed returned';
      });
      const { getByText, getAllByText } = renderLoanProxyDetails(propsData);

      userEvent.click(getAllByText('ui-users.loans.declareLost')[0]);
      userEvent.click(getAllByText('ui-users.loans.declareLost')[1]);
      userEvent.click(screen.queryAllByRole('button')[0]);
      userEvent.click(screen.queryAllByRole('button')[5]);
      userEvent.click(screen.queryAllByRole('button')[11]);
      userEvent.click(getByText('ui-users.loans.markAsMissing'));
      userEvent.click(getByText('Cancel Form'));
      userEvent.click(getByText('Reset Form'));
      userEvent.click(getByText('Submit Form'));
      userEvent.click(getByText('Close Button'));
      expect(screen.getAllByText('ui-users.loans.markAsMissing')).toBeTruthy();
    });
    it.skip('Fee Fine Else Condition More than 1 loanAccountActions with Amount 0', () => {
      mockGetLodash.mockReset();
      mockGetLodash.mockImplementation(() => {
        return 'Claimed returned';
      });
      mockAccounts.mockReset();
      mockAccounts.mockImplementation(() => {
        return true;
      });
      const updatedPropsData = {
        ...propsData,
        loanAccountActions: [
          { acc: 0, amount: 0 },
          { acc: 0, amount: 0 },
        ],
      };
      renderLoanProxyDetails(updatedPropsData);
      userEvent.click(screen.queryAllByRole('button')[5]);
      userEvent.click(screen.queryAllByRole('button')[9]);
      expect(screen.getAllByText('ui-users.loans.markAsMissing')).toBeTruthy();
    });
    it.skip('Fee Fine Else Condition More than 1 loanAccountActions', () => {
      mockGetLodash.mockReset();
      mockGetLodash.mockImplementation(() => {
        return 'Claimed returned';
      });
      mockAccounts.mockReset();
      mockAccounts.mockImplementation(() => {
        return true;
      });
      const updatedPropsData = {
        ...propsData,
        loanAccountActions: [{}, {}],
      };
      renderLoanProxyDetails(updatedPropsData);
      userEvent.click(screen.queryAllByRole('button')[5]);
      userEvent.click(screen.queryAllByRole('button')[9]);
      expect(screen.getAllByText('ui-users.loans.markAsMissing')).toBeTruthy();
    });
    it.skip('Fee Fine Else Condition More than 1 loanAccountActions with open item', () => {
      mockGetLodash.mockReset();
      mockGetLodash.mockImplementation(() => {
        return 'Claimed returned';
      });
      mockAccounts.mockReset();
      mockAccounts.mockImplementation((item1, item2) => {
        return item2 === 'open';
      });
      const updatedPropsData = { ...propsData, loanAccountActions: [{}, {}] };
      renderLoanProxyDetails(updatedPropsData);

      userEvent.click(screen.queryAllByRole('button')[5]);
      expect(screen.getAllByText('ui-users.loans.markAsMissing')).toBeTruthy();
    });
    it.skip('Fee Fine Else Condition More than 1 loanAccountActions with new loan', () => {
      mockGetLodash.mockReset();
      mockGetLodash.mockImplementation(() => {
        return 'Claimed returned';
      });
      mockAccounts.mockReset();
      mockAccounts.mockImplementation(() => {
        return false;
      });
      let updatedPropsData = {
        ...propsData,
        loanAccountActions: [{}, {}],
      };
      renderLoanProxyDetails(updatedPropsData);
      updatedPropsData = {
        ...updatedPropsData,
        loan: { ...updatedPropsData.loan, item: { status: { name: 'new' } } },
      };
      userEvent.click(screen.queryAllByRole('button')[5]);
      expect(screen.getAllByText('ui-users.loans.markAsMissing')).toBeTruthy();
    });
    it('Component is loading with out policies', () => {
      mockGetLodash.mockReset();
      mockGetLodash.mockImplementation(() => {
        return 'Claimed returned';
      });
      mockAccounts.mockReset();
      mockAccounts.mockImplementation(() => {
        return false;
      });
      const updatedPropsData = {
        ...propsData,
        isLoading: true,
        loanPolicies: {
          '985fd5a1-3634-4b0d-8c13-0d4fcf0b8afa': false,
        },
      };
      renderLoanProxyDetails(updatedPropsData);
      expect(screen.getAllByText('ui-users.loans.history')).toBeTruthy();
    });
    it('Component is loading with close modal', () => {
      mockGetLodash.mockReset();
      mockGetLodash.mockImplementation(() => {
        return 'Claimed returned';
      });
      mockAccounts.mockReset();
      mockAccounts.mockImplementation(() => {
        return false;
      });
      const updatedPropsData = {
        ...propsData,
        isLoading: false,
        loanPolicies: {
          '985fd5a1-3634-4b0d-8c13-0d4fcf0b8afa': false,
        },
      };
      renderLoanProxyDetails(updatedPropsData);
      expect(screen.getAllByText('Close Modal')).toBeTruthy();
    });
    it('Component is loading with declared lost', () => {
      mockGetLodash.mockReset();
      mockGetLodash.mockImplementation((item) => {
        return item.filter ? item.filter : 'Declared lost';
      });
      mockAccounts.mockReset();
      mockAccounts.mockImplementation(() => {
        return false;
      });
      const updatedPropsData = {
        ...propsData,
        isLoading: false,
        loanActionsWithUser: [
          {
            action: 'Declared lost',
            filter: 'declaredLost',
            metadata: {
              updatedDate: '2023-05-01'
            }
          }
        ],
      };
      renderLoanProxyDetails(updatedPropsData);
      expect(screen.getAllByText('ui-users.loans.details.borrower')).toBeTruthy();
    });
    it('Component is loading with age', () => {
      mockGetLodash.mockReset();
      mockGetLodash.mockImplementation((item) => {
        return item.filter ? item.filter : 'Aged to lost';
      });
      mockAccounts.mockReset();
      mockAccounts.mockImplementation(() => {
        return false;
      });
      mockIsEmpty.mockReset();
      mockIsEmpty.mockImplementation(() => true);
      const updatedPropsData = {
        ...propsData,
        isLoading: false,
        loanActionsWithUser: [
          {
            action: 'User Call',
            filter: 'itemAgedToLost',
            metadata: {
              updatedDate: '2023-05-01'
            }
          }
        ],
      };
      const { getAllByText } = renderLoanProxyDetails(updatedPropsData);
      userEvent.click(getAllByText('Close Modal')[0]);
      userEvent.click(screen.getAllByRole('button')[1]);
      expect(screen.getAllByText('Close Modal')).toBeTruthy();
    });
  });

  describe('disable all open loan action when user is virtual patron', () => {
    const virtualPatronPropsData = {
      ...propsData,
      user: {
        ...propsData.user,
        type: 'dcb',
      }
    };

    it('should disable Renew button', () => {
      renderLoanProxyDetails({
        ...virtualPatronPropsData,
      });
      expect(screen.getByRole('button', { name:'ui-users.renew' })).toBeDisabled();
    });

    it('should disable "Claim returned" button', () => {
      renderLoanProxyDetails({
        ...virtualPatronPropsData,
      });
      expect(screen.getByRole('button', { name:'ui-users.loans.claimReturned' })).toBeDisabled();
    });
    it('should disable "Change due date" button', () => {
      renderLoanProxyDetails({
        ...virtualPatronPropsData,
      });
      expect(screen.getByRole('button', { name:'stripes-smart-components.cddd.changeDueDate' })).toBeDisabled();
    });
    it('should disable "Declare lost" button', () => {
      renderLoanProxyDetails({
        ...virtualPatronPropsData,
      });
      expect(screen.getByRole('button', { name:'ui-users.loans.declareLost' })).toBeDisabled();
    });
    it('should disable "New patron info" button', () => {
      renderLoanProxyDetails({
        ...virtualPatronPropsData,
      });
      expect(screen.getByRole('button', { name:'ui-users.loans.newPatronInfo' })).toBeDisabled();
    });
    it('should disable "New staff info" button', () => {
      renderLoanProxyDetails({
        ...virtualPatronPropsData,
      });
      expect(screen.getByRole('button', { name:'ui-users.loans.newStaffInfo' })).toBeDisabled();
    });
  });

  describe('when item is dcb item', () => {
    const virtualItemPropsData = {
      ...propsData,
      loan: {
        ...okapiOpenLoan,
        item: {
          ...okapiOpenLoan.item,
          instanceId: DCB_INSTANCE_ID,
          holdingsRecordId: DCB_HOLDINGS_RECORD_ID,
          title: 'Vitual item',
          barcode: 'virtual barcode'
        }
      }
    };

    it('render item title not as a link but as text', () => {
      renderLoanProxyDetails({
        ...virtualItemPropsData,
      });

      expect(screen.queryByRole('link', { name: /Virtual item/i })).toBeNull();
      expect(within(screen.getByTestId('item-title')).queryByText('Virtual Item')).toBeDefined();
    });

    it('render item barcode as text', () => {
      renderLoanProxyDetails({
        ...virtualItemPropsData,
      });

      expect(screen.queryByRole('link', { name: /Virtual barcode/i })).toBeNull();
      expect(within(screen.getByTestId('item-barcode')).queryByText('Virtual barcode')).toBeDefined();
    });
  });
});

import React from 'react';
import userEvent from '@testing-library/user-event';
import {
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import {
  useStripes,
  IfInterface,
} from '@folio/stripes/core';
import { StripesContext } from '@folio/stripes-core/src/StripesContext';
import '__mock__';
import UserDetail from './UserDetail';
import {
  PatronBlock,
} from '../../components/UserDetailSections';

const resources = {
  accounts: {},
  addressTypes: {},
  creds: {},
  delUser: {},
  departments: {},
  feefineactions: {},
  hasAutomatedPatronBlocks: {},
  hasManualPatronBlocks: {},
  loanRecords: {},
  loansHistory: {},
  openTransactions: {},
  patronGroups: {},
  permUserId: {},
  permissions: {},
  perms: {},
  proxies: {},
  proxiesFor: {},
  query: {},
  records: {
    username: 'rick, psych',
    id: '84954cee-c6f9-4478-8ebd-80f04bc8571d',
    active: true,
    patronGroup:'3684a786-6671-4268-8ed0-9db82ebca60b',
    departments:[],
    proxyFor:[],
    personal:{ lastName:'psych', firstName:'rick', email:'psych@ub.example.org', addresses:[], preferredContactTypeId:'002' },
    createdDate:'2021-06-03T09:56:40.796+00:00',
    updatedDate:'2021-06-03T09:56:40.796+00:00',
    metadata:{ createdDate:'2021-05-27T11:20:51.547+00:00', updatedDate:'2021-06-03T09:56:40.779+00:00', updatedByUserId:'d88b5896-fcd2-5a3b-bc63-7749a913b786' },
    customFields:{},
  },
  requestPreferences: {},
  selUser: {
    records: [{
      username: 'rick, psych',
      id: '84954cee-c6f9-4478-8ebd-80f04bc8571d',
      active: true,
      patronGroup:'3684a786-6671-4268-8ed0-9db82ebca60b',
      departments:[],
      proxyFor:[],
      personal:{ lastName:'psych', firstName:'rick', email:'psych@ub.example.org', addresses:[], preferredContactTypeId:'002' },
      createdDate:'2021-06-03T09:56:40.796+00:00',
      updatedDate:'2021-06-03T09:56:40.796+00:00',
      metadata:{ createdDate:'2021-05-27T11:20:51.547+00:00', updatedDate:'2021-06-03T09:56:40.779+00:00', updatedByUserId:'d88b5896-fcd2-5a3b-bc63-7749a913b786' },
      customFields:{},
    }]
  },
  servicePointUserId: {},
  servicePoints: {},
  servicePointsUsers: {},
  settings: {},
  sponsors: {},
  sponsorsFor: {},
  tagSettings: {},
  uniquenessValidator: {},
};

const doFetchOpenTransactions = jest.fn(() => Promise.resolve());
const mutator = {
  delUser: {
    DELETE: jest.fn(),
  },
  openTransactions: {
    GET: doFetchOpenTransactions,
  },
  hasManualPatronBlocks: {
    GET: jest.fn(),
  },
  hasAutomatedPatronBlocks: {
    GET: jest.fn(),
  },
};

jest.mock(
  '@folio/stripes-components/util/currencies.js',
  () => {
    return () => <span>currencies</span>;
  }
);

jest.mock(
  '../../components/RequestFeeFineBlockButtons',
  () => jest.fn(() => null),
);

jest.mock(
  '../../components/PatronBlock',
  () => ({
    PatronBlockMessage: jest.fn(() => null),
  })
);

jest.mock(
  '../../components/UserDetailSections',
  () => ({
    UserInfo: jest.fn(() => null),
    ExtendedInfo: jest.fn(() => null),
    ContactInfo: jest.fn(() => null),
    ProxyPermissions: jest.fn(() => null),
    PatronBlock: jest.fn(() => null),
    UserPermissions: jest.fn(() => null),
    UserLoans: jest.fn(() => null),
    UserRequests: jest.fn(() => null),
    UserAccounts: jest.fn(() => null),
    UserServicePoints: jest.fn(() => null),
  })
);

jest.mock(
  '../../../icons/app.png',
  () => {
    return () => <span>AppIcon</span>;
  }
);

IfInterface.mockImplementation(({ children }) => children);

const match = {
  isExact: false,
  params: { id: '84954cee-c6f9-4478-8ebd-80f04bc8571d' },
  path: '/users/preview/:id',
  url: '/users/preview/84954cee-c6f9-4478-8ebd-80f04bc8571d',
};

const okapi = {
  url: 'http://localhost:9130',
  tenant: 'diku',
  currentUser: {
    id: 'a10d6508-f8cb-547c-9ab1-7059f869b6f0',
    username: 'diku_admin',
    lastName: 'ADMINISTRATOR',
    firstName: 'DIKU',
    servicePoints: [{
      code: 'cd2',
      discoveryDisplayName: 'Circulation Desk -- Back Entrance',
      holdShelfExpiryPeriod: { duration: 5, intervalId: 'Days' },
      id: 'c4c90014-c8c9-4ade-8f24-b5e313319f4b',
      locationIds: [],
      metadata: { createdDate: '2021-06-10T11:13:11.733+00:00', updatedDate: '2021-06-10T11:13:11.733+00:00' },
      name: 'Circ Desk 2',
      pickupLocation: true,
      staffSlips: [],
    }]
  }
};

const getSponsors = jest.fn();
const getProxies = jest.fn();
const getUserServicePoints = jest.fn();
const getPreferredServicePoint = jest.fn();

const renderUserDetail = (stripes) => {
  return render(
    <StripesContext.Provider value={stripes}>
      <UserDetail
        resources={resources}
        mutator={mutator}
        match={match}
        stripes={stripes}
        getSponsors={getSponsors}
        getProxies={getProxies}
        getUserServicePoints={getUserServicePoints}
        getPreferredServicePoint={getPreferredServicePoint}
        okapi={okapi}
      />
    </StripesContext.Provider>
  );
};

describe('UserDetail', () => {
  let stripes;

  beforeEach(() => {
    stripes = useStripes();
    mutator.hasManualPatronBlocks.GET.mockImplementation(() => Promise.resolve([]));
    mutator.hasAutomatedPatronBlocks.GET.mockImplementation(() => Promise.resolve([]));
  });

  afterEach(() => {
    mutator.hasManualPatronBlocks.GET.mockClear();
    mutator.hasAutomatedPatronBlocks.GET.mockClear();
    PatronBlock.mockClear();
  });

  describe('render UserDetail', () => {
    [
      [],
      [{
        type: 'Manual',
        desc: 'test',
        staffInformation: '',
        patronMessage: '',
        borrowing: true,
        renewals: true,
        requests: true,
        userId: 'e14b1bc1-8784-4b55-bfbe-e5ec8ce0b07a',
        metadata: {
          createdDate: '2021-10-07T21:05:16.506+00:00',
          createdByUserId: 'b027a9f8-39d7-5428-b876-d95be29fd183',
          updatedDate: '2021-10-07T21:05:16.506+00:00',
          updatedByUserId: 'b027a9f8-39d7-5428-b876-d95be29fd183',
        },
        id: 'bdf32aee-e8e6-42ff-847f-7bd9bf6dc485',
      }],
    ].forEach((manualPatronBlocks) => {
      describe(`when manual patron blocks${manualPatronBlocks.length ? '' : ' do not'} exist`, () => {
        [
          [],
          [{
            patronBlockConditionId: '3d7c52dc-c732-4223-8bf8-e5917801386f',
            blockBorrowing: true,
            blockRenewals: false,
            blockRequests: false,
            message: 'test charged out',
          }],
        ].forEach((automatedPatronBlocks) => {
          describe(`
            when automated patron blocks${automatedPatronBlocks.length ? '' : ' do not'} exist
          `, () => {
            beforeEach(() => {
              mutator.hasManualPatronBlocks
                .GET.mockImplementation(() => Promise.resolve(manualPatronBlocks));
              mutator.hasAutomatedPatronBlocks
                .GET.mockImplementation(() => Promise.resolve(automatedPatronBlocks));

              renderUserDetail(stripes);
            });

            it('should render PatronBlock', async () => {
              await waitFor(() => expect(mutator.hasManualPatronBlocks.GET).toHaveBeenCalledTimes(1));
              await waitFor(() => expect(mutator.hasAutomatedPatronBlocks.GET).toHaveBeenCalledTimes(1));
              await waitFor(() => expect(PatronBlock).toHaveBeenLastCalledWith(
                expect.objectContaining({
                  expanded: !!(automatedPatronBlocks.length || manualPatronBlocks.length),
                }),
                {}
              ));
            });
          });
        });
      });
    });

    test('UserDetail pane should be present', async () => {
      renderUserDetail(stripes);
      expect(document.querySelector('#pane-userdetails')).toBeInTheDocument();
    });

    test('should render checkDelete button in action menu ', async () => {
      renderUserDetail(stripes);
      expect(screen.getByRole('button', { name: 'ui-users.details.checkDelete' })).toBeVisible();
    });

    describe('click checkDelete button', () => {
      beforeEach(() => {
        renderUserDetail(stripes);
        userEvent.click(screen.getByRole('button', { name: 'ui-users.details.checkDelete' }));
      });

      test('should call doFetchOpenTransactions', async () => {
        expect(doFetchOpenTransactions).toHaveBeenCalled();
      });
    });
  });
});

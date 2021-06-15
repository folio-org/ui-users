import React from 'react';
// import { MemoryRouter } from 'react-router-dom';
// import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react'; // screen
import { useStripes } from '@folio/stripes/core';
import { StripesContext } from '@folio/stripes-core/src/StripesContext';
// import { server, rest } from '../../../test/jest/testServer';
import '../../../test/jest/__mock__';
import UserDetail from './UserDetail';

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

const mutator = {
  delUser: jest.fn,
  openTransactions: jest.fn,
};

// const manualblocks = [
//   {
//     'type' : 'Manual',
//     'desc' : 'desc',
//     'staffInformation' : 'info',
//     'patronMessage' : '',
//     'borrowing' : true,
//     'renewals' : true,
//     'requests' : true,
//     'userId' : '84954cee-c6f9-4478-8ebd-80f04bc8571d',
//     'metadata' : {
//       'createdDate' : '2021-06-02T06:51:30.194+00:00',
//       'createdByUserId' : 'd88b5896-fcd2-5a3b-bc63-7749a913b786',
//       'updatedDate' : '2021-06-02T06:51:30.194+00:00',
//       'updatedByUserId' : 'd88b5896-fcd2-5a3b-bc63-7749a913b786'
//     },
//     'id' : 'f1f7018c-5301-450c-9edd-8514aa6f2604'
//   },
// ];

jest.mock(
  '@folio/stripes-components/util/currencies.js',
  () => {
    return () => <span>currencies</span>;
  }
);

jest.mock(
  '../../../icons/app.png',
  () => {
    return () => <span>AppIcon</span>;
  }
);

// jest.mock(
//   '@folio/stripes-core/src/components/AppIcon/AppIcon.js',
//   () => {
//     return () => <span>AppIcon</span>;
//   }
// );

// jest.mock(
//   '../../components/UserDetailSections/ViewCustomFieldsRecord',
//   () => {
//     return () => <span>ViewCustomFieldsRecord</span>;
//   }
// );

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

describe('render UserDetail', () => {
  let stripes;

  beforeEach(() => {
    stripes = useStripes();
  });

  describe('render UserDetail', () => {
    test('UserDetail should be present', async () => {
      renderUserDetail(stripes);
      expect(document.querySelector('#pane-userdetails')).toBeInTheDocument();
    });

    // test('should render action menu button', async () => {
    //   renderUserDetail(stripes);
    //   expect(screen.getByRole('button', { name: 'ui-users.actions' })).toBeVisible();
    // });

    // describe('test action menu', () => {
    //   beforeEach(() => {
    //     renderUserDetail();
    //     userEvent.click(screen.getByRole('button', { name: 'ui-users.actions' }));
    //   });

    //   test('should render action menu with checkdelete', async () => {
    //     expect(document.querySelector('#clickable-checkdeleteuser')).not.toBeInTheDocument();
    //   });
    // });
  });

  // describe('render UserDetail with NO openTransactions', () => {
  //   test('check opent transactions', async () => {
  //     server.use(
  //       rest.get(
  //         // hasNoOpenTransactions
  //         'https://folio-testing-okapi.dev.folio.org/bl-users/by-id/84954cee-c6f9-4478-8ebd-80f04bc8571d/open-transactions',
  //         (req, res, ctx) => {
  //           return res(ctx.status(200), ctx.body({
  //             'userId' : '84954cee-c6f9-4478-8ebd-80f04bc8571d',
  //             'hasOpenTransactions' : false,
  //             'loans' : 0,
  //             'requests' : 0,
  //             'feesFines' : 0,
  //             'proxies' : 0,
  //             'blocks' : 0
  //           }));
  //         }
  //       )
  //     );
  //     renderUserDetail();
  //     expect(document.querySelector('#delete-user-modal')).toBeInTheDocument();
  //     expect(document.querySelector('#open-transactions-modal')).not.toBeInTheDocument();
  //   });
  // });
});

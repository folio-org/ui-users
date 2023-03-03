import React from 'react';
import { screen } from '@testing-library/react';
import user from 'fixtures/okapiCurrentUser';
import loan from 'fixtures/openLoan';
import '__mock__/stripesCore.mock';
import renderWithRouter from 'helpers/renderWithRouter';
import LoansListing from './LoansListing';

jest.unmock('@folio/stripes/components');
jest.unmock('@folio/stripes/util');

const renderLoansListing = (extraprops) => renderWithRouter(<LoansListing {...extraprops} />);

const mutator = {
  query: {},
  claimReturned: {
    POST: () => new Promise((resolve, _) => { resolve({ ok: true }); }),
  },
  feefineactions: {
    GET: jest.fn(),
    POST: jest.fn(),
  },
  loanId: {
    replace: jest.fn(),
  },
  activeRecord: {
    update: jest.fn(),
  },
  accounts: {
    GET: jest.fn(),
    PUT: jest.fn()
  },
  loanstorage: {
    GET: jest.fn(),
    PUT: jest.fn()
  },
  activeAccount: {
    update: jest.fn()
  },
  activeLoanStorage: {
    update: jest.fn()
  }
};

const mockedCurServicePoint = {
  id: 'curServicePointId',
};
const mockedCurrentUser = {
  curServicePoint: mockedCurServicePoint,
  firstName: 'currentUserFirstName',
  lastName: 'currentUserLastName',
};

const mockedOkapi = {
  currentUser: mockedCurrentUser,
};

function props(loanStatus) {
  return {
    stripes: {
      connect: (Component) => xprops => <Component {...xprops} okapi={mockedOkapi} mutator={mutator} />,
      config: {},
      currency: 'USD',
      actionNames: [],
      setBindings: jest.fn(),
      setCurrency: jest.fn(),
      setLocale: jest.fn(),
      setSinglePlugin: jest.fn(),
      setTimezone: jest.fn(),
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
    },
    mutator,
    user,
    patronGroup: {
      desc: 'Faculty Member',
      expirationOffsetInDays: 365,
      group: 'faculty',
      id: '503a81cd-6c26-400f-b620-14c08943697c',
    },
    okapi: mockedOkapi,
    patronBlocks: [],
    match: {
      path: '/users/:id/loans/:loanstatus',
      params: {
        id: 'a51df26e-b472-5c06-8362-01025b90238b',
        loanstatus: loanStatus,
      },
    },
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
            id: '684a786-6671-4268-8ed0-9db82ebca60b',
          },
        ],
      },
      query: {
        query: '',
      },
    },
    loan,
    loansHistory: [{ status: { name: '' } }],
    location: { search: 'search', pathname: 'pathname' },
    history: {},
  };
}

describe('test cases for LoansListing', () => {
  test('Check for title', () => {
    renderLoansListing(props('open'));
    expect(screen.queryAllByText('ui-users.loans.title -  (Faculty)')).toBeTruthy();
  });

  test('Check for open loans tab', () => {
    renderLoansListing(props('open'));
    expect(document.querySelector('[id="open-loans-list-panel"]')).toBeTruthy();
  });

  test('Check for closed loans tab', () => {
    renderLoansListing(props('closed'));
    expect(document.querySelector('[id="closed-loans-list-panel"]')).toBeTruthy();
  });
});

import { act } from 'react';
import { createMemoryHistory } from 'history';

import { render } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

import UserSearchContainer, { buildQuery } from './UserSearchContainer';
import Harness from '../../test/jest/helpers/Harness';

jest.unmock('react-intl');

jest.mock('@folio/stripes/components', () => ({
  ...jest.requireActual('@folio/stripes/components'),
  Icon: ({ children }) => <span>{children}</span>,
}));

jest.mock('@folio/service-interaction', () => ({
  NumberGeneratorModalButton: () => <div>NumberGeneratorModalButton</div>
}));

const totalRecords = 1200;

const mockOkapiKy = jest.fn().mockReturnValue({
  json: jest.fn().mockResolvedValue({
    id: '1',
    totalRecords,
  }),
});

const location = {
  pathname: '/users',
  search: '?sort=name',
  hash: '',
};

const match = {
  isExact: true,
  params: {},
  path: '/users',
  url: '/users',
};

const okapi = {
  currentUser: {
    servicePoints: [
      {
        id: '3a40852d-49fd-4df2-a1f9-6e2641a6e91f',
        name: 'Circ Desk 1',
        code: 'cd1',
        discoveryDisplayName: 'Circulation Desk -- Hallway',
        pickupLocation: true,
        staffSlips: [],
        locationIds: [],
      },
    ],
  },
};

const mutator = Object.keys(UserSearchContainer.manifest || {}).reduce((acc, mutatorName) => {
  const returnValue = UserSearchContainer.manifest[mutatorName].records ? [] : {};

  acc[mutatorName] = {
    GET: jest.fn().mockReturnValue(Promise.resolve(returnValue)),
    PUT: jest.fn().mockReturnValue(Promise.resolve()),
    POST: jest.fn().mockReturnValue(Promise.resolve()),
    DELETE: jest.fn().mockReturnValue(Promise.resolve()),
    reset: jest.fn(),
    update: jest.fn(),
    replace: jest.fn(),
  };

  return acc;
}, {
  resultOffset: {
    replace: jest.fn(),
  },
});

const resources = {
  initializedFilterConfig: { records: [] },
  query: { records: [] },
  resultCount: { records: [] },
  resultOffset: { records: [] },
  records: { records: [] },
  patronGroups: { records: [] },
  loans: { records: [] },
  tags: { records: [] },
  departments: { records: [] },
  owners: { records: [] },
  refundsReport: { records: [] },
  cashDrawerReport: { records: [] },
  cashDrawerReportSources: { records: [] },
  financialTransactionsReport: { records: [] }
};

const getUserSearchContainer = (_props = {}) => {
  return (
    <Harness>
      <UserSearchContainer
        location={location}
        okapi={okapi}
        match={match}
        history={createMemoryHistory()}
        resources={resources}
        mutator={mutator}
        okapiKy={mockOkapiKy}
        {..._props}
      />
    </Harness>
  );
};

const renderUserSearchContainer = (_props = {}) => render(getUserSearchContainer(_props));

describe('UserSearchContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch users with limit 0, query and filters', async () => {
    await act(() => renderUserSearchContainer({
      resources: {
        ...resources,
        query: {
          query: 'test',
          filters: 'active.active',
          sort: 'name',
        },
      },
    }));

    expect(mockOkapiKy).toHaveBeenCalledTimes(1);
    expect(mockOkapiKy).toHaveBeenCalledWith(expect.stringContaining(
      'users?limit=0&query=((keywords="test*") and active=="true")'
    ));
  });

  describe('when query and filters are not present', () => {
    it('should not fetch users with limit 0', async () => {
      await act(() => renderUserSearchContainer({
        resources: {
          ...resources,
          query: {
            query: '',
            filters: '',
            sort: 'name',
          },
        },
      }));

      expect(mockOkapiKy).not.toHaveBeenCalled();
    });
  });

  it('should display the correct number of records in the results sub pane', async () => {
    const { getByText } = await act(() => renderUserSearchContainer({
      resources: {
        ...resources,
        query: {
          query: 'test',
          sort: 'name',
        },
      },
    }));

    expect(getByText('1,200 records found')).toBeVisible();
  });

  describe('when Reset all button is hit', () => {
    it('should reset the query, filters and total records', async () => {
      const { getByRole, queryByText, getByText } = await act(() => renderUserSearchContainer({
        resources: {
          ...resources,
          query: {
            query: 'test',
            filters: 'active.active',
          },
        },
      }));

      const searchField = getByRole('searchbox', { name: 'Search & filter' });
      const activeFilter = getByRole('checkbox', { name: 'Active' });

      await act(() => userEvent.type(searchField, 'test1'));
      await act(() => userEvent.click(activeFilter));

      expect(getByText('1,200 records found')).toBeVisible();
      expect(searchField).toHaveValue('test1');
      expect(activeFilter).toBeChecked();

      await act(() => userEvent.click(getByRole('button', { name: 'Reset all' })));

      expect(searchField).toHaveValue('');
      expect(activeFilter).not.toBeChecked();
      expect(queryByText('1,200 records found')).not.toBeInTheDocument();
    });
  });

  describe('when searching', () => {
    it('should reset offset so that next search starts from the beginning', async () => {
      const { getByRole } = await act(() => renderUserSearchContainer({
        resources: {
          ...resources,
          query: {
            query: 'test',
            filters: 'active.active',
          },
        },
      }));

      const searchField = getByRole('searchbox', { name: 'Search & filter' });

      await act(() => userEvent.type(searchField, 'test1'));
      await act(() => userEvent.click(getByRole('button', { name: 'Search' })));

      expect(mutator.resultOffset.replace).toHaveBeenCalledWith(0);
    });
  });

  describe('when there is a single record returned', () => {
    it('should open detail view automatically', async () => {
      const history = createMemoryHistory();
      history.push = jest.fn();

      const { rerender } = await act(() => renderUserSearchContainer());

      await act(() => rerender(getUserSearchContainer({
        history,
        resources: {
          ...resources,
          records: {
            hasLoaded: true,
            other: {
              totalRecords: 1,
            },
            records: [{
              id: 'user-id-1',
              username: 'testuser',
              email: 'testuser@example.com',
              active: true,
            }]
          },
          query: {
            query: 'test',
            filters: 'active.active',
          },
        },
      })));

      expect(history.push).toHaveBeenCalledWith('/users/preview/user-id-1?sort=name');
    });
  });
});

const queryParams = {
  filters: 'active.active',
  query: 'Joe',
  sort: 'name',
};
const pathComponents = {};
const resourceData = {
  query: queryParams,
};
const logger = {
  log: jest.fn(),
};
const mockHasInterface = jest.fn().mockReturnValue(0);
const props = {
  stripes: {
    hasInterface: mockHasInterface,
  }
};

describe('buildQuery', () => {
  it('should return empty CQL query', () => {
    expect(buildQuery({}, pathComponents, { query: {} }, logger, props)).toBeFalsy();
  });

  it('should include username when building CQL query when stripes "users" interface is less than 16.3', () => {
    expect(buildQuery(queryParams, pathComponents, resourceData, logger, props)).toEqual(expect.stringContaining('username="Joe*"'));
  });

  it('should include "keywords" when building CQL query when stripes "users" interface is 16.3', () => {
    mockHasInterface.mockReturnValue(16.3);
    expect(buildQuery(queryParams, pathComponents, resourceData, logger, props)).toEqual(expect.stringContaining('keywords="Joe*"'));
  });
});

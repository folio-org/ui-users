import okapiCurrentUser from 'fixtures/okapiCurrentUser';
import loan from 'fixtures/openLoan';
import getListDataFormatter from './getListDataFormatter';

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

const formatMessageMock = jest.fn();
const contributorsMock = jest.fn(() => ['test', 'test2', 'test3']);
const getFeeFineMock = jest.fn();

const formatMessage = formatMessageMock;
const toggleItem = jest.fn();
const isLoanChecked = jest.fn();
const requestCounts = {};
const requestRecords = [];
const resources = {
  activeRecord: { user: 'ab579dc3-219b-4f5b-8068-ab1c7a55c402' },
  loanAccount: { records: [] },
};
const getLoanPolicy = jest.fn();
const handleOptionsChange = jest.fn();
const stripes = STRIPES;
const getFeeFine = getFeeFineMock;
const getContributorslist = contributorsMock;
const feeFineCount = jest.fn();
const user = okapiCurrentUser;

const sortOrderKeys = [
  'title',
  'itemStatus',
  'dueDate',
  'requests',
  'barcode',
  'feefineIncurred',
];

describe('Data Formatter component', () => {
  it('Checking Loan Date and loan policy', async () => {
    const data = getListDataFormatter(formatMessage, toggleItem, isLoanChecked, requestCounts,
      requestRecords, resources, getLoanPolicy, handleOptionsChange, stripes, getFeeFine,
      getContributorslist, feeFineCount, user);
    data.loanDate.sorter(loan);
    data.loanDate.formatter(loan);
    data.loanPolicy.sorter(loan);
    data.loanPolicy.formatter(loan);
    data.location.sorter(loan);
    data.location.formatter(loan);
    expect(formatMessageMock).toHaveBeenCalled();
  });
  it('Checking sort order key', () => {
    const data = getListDataFormatter(formatMessage, toggleItem, isLoanChecked, requestCounts,
      requestRecords, resources, getLoanPolicy, handleOptionsChange, stripes, getFeeFine,
      getContributorslist, feeFineCount, user);
    sortOrderKeys.reduce((sortMap, index) => {
      const {
        formatter,
        sorter,
      } = data[index];
      sorter(loan);
      formatter(loan);

      return sorter(loan);
    }, {});
    expect(formatMessageMock).toHaveBeenCalled();
    expect(getFeeFineMock).toHaveBeenCalled();
  });
  it('Checking contributors', async () => {
    const data = getListDataFormatter(formatMessage, toggleItem, isLoanChecked, requestCounts,
      requestRecords, resources, getLoanPolicy, handleOptionsChange, stripes, getFeeFine,
      getContributorslist, feeFineCount, user);
    data.contributors.sorter(loan);
    data.contributors.formatter(loan);
    expect(contributorsMock).toHaveBeenCalled();
  });
  it('Checking renewals', async () => {
    const data = getListDataFormatter(formatMessage, toggleItem, isLoanChecked, requestCounts,
      requestRecords, resources, getLoanPolicy, handleOptionsChange, stripes, getFeeFine,
      getContributorslist, feeFineCount, user);
    expect(data.renewals.formatter(loan)).toBe(1);
    expect(data.renewals.sorter(loan)).toBe(1);
  });
  it('Checking empty', async () => {
    const data = getListDataFormatter(formatMessage, toggleItem, isLoanChecked, requestCounts,
      requestRecords, resources, getLoanPolicy, handleOptionsChange, stripes, getFeeFine,
      getContributorslist, feeFineCount, user);
    data[' '].formatter(loan);
    data['  '].formatter(loan);
    expect(getFeeFineMock).toHaveBeenCalled();
  });
});

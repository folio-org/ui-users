import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryHistory } from 'history';

import { effectiveCallNumber } from '@folio/stripes/util';

import okapiLoans from '../../../../test/jest/fixtures/openLoans';
import okapiCurrentUser from '../../../../test/jest/fixtures/okapiCurrentUser';
import ClosedLoans from './ClosedLoans';

import {
  calculateSortParams,
  getChargeFineToLoanPath,
  nav,
} from '../../util';

jest.unmock('@folio/stripes/components');
jest.mock('../../util', () => ({
  calculateSortParams: jest.fn(),
  getChargeFineToLoanPath: jest.fn(),
  nav: {
    onClickViewLoanActionsHistory: jest.fn(),
    onClickViewOpenAccounts: jest.fn(),
    onClickViewClosedAccounts: jest.fn(),
  }
}));
jest.mock('@folio/stripes/util', () => ({
  effectiveCallNumber: jest.fn(),
}));

const STRIPES = {
  connect: (Component) => Component,
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
};

const history = createMemoryHistory();

const mockAnonymizeLoans = jest.fn();

const notEmptyRecords = [{
  loanId: 'b6475706-4505-4b20-9ed0-aadcda2b72ee',
  amount: 25,
  barcode: '10101',
  callNumber: 'TK5105.88815 . A58 2004 FT MEADE Copy 2',
  contributors: [],
  feeFineId: '9d4e45a9-e2bc-4105-83cd-2caef09157b5',
  feeFineOwner: 'MyO',
  feeFineType: 'MyFF',
  holdingsRecordId: 'e3ff6133-b9a2-4d4c-a1c9-dc1867d4df19',
  id: 'e0a8cfcf-4939-4815-9217-4032121edafb',
  instanceId: '5bf370e0-8cca-4d9c-82e4-5170ab2a0a39',
  itemId: '7212ba6a-8dcf-45a1-be9a-ffaa847c4423',
  location: 'Main Library',
  materialType: 'book',
  materialTypeId: '1a54b431-2e4f-452d-9cae-9cee66c9a892',
  metadata: {
    createdDate: '2022-06-06T07:25:37.639+00:00',
    createdByUserId: 'd784470b-2e2d-528d-9641-b81fd924a4a8',
    updatedDate: '2022-06-06T07:26:37.032+00:00',
    updatedByUserId: 'd784470b-2e2d-528d-9641-b81fd924a4a8'
  },
  ownerId: 'f5fe5c18-fa38-4e1b-b65d-1b214f736987',
  paymentStatus: { name: 'Cancelled as error' },
  remaining: 0,
  status: { name: 'Closed' },
  title: 'A semantic web primer',
  userId: 'bec20636-fb68-41fd-84ea-2cf910673599',
},
{ loanId: 'b6475706-4505-4b20-9ed0-aadcda2b72ee',
  amount: 25,
  barcode: '10101',
  callNumber: 'TK5105.88815 . A58 2004 FT MEADE Copy 2',
  contributors: [],
  feeFineId: '9d4e45a9-e2bc-4105-83cd-2caef09157b5',
  feeFineOwner: 'MyO',
  feeFineType: 'MyFF',
  holdingsRecordId: 'e3ff6133-b9a2-4d4c-a1c9-dc1867d4df19',
  id: 'e0a8cfcf-4939-4815-9217-4032121edafb',
  instanceId: '5bf370e0-8cca-4d9c-82e4-5170ab2a0a39',
  itemId: '7212ba6a-8dcf-45a1-be9a-ffaa847c4423',
  location: 'Main Library',
  materialType: 'book',
  materialTypeId: '1a54b431-2e4f-452d-9cae-9cee66c9a892',
  metadata: {
    createdDate: '2022-06-06T07:25:37.639+00:00',
    createdByUserId: 'd784470b-2e2d-528d-9641-b81fd924a4a8',
    updatedDate: '2022-06-06T07:26:37.032+00:00',
    updatedByUserId: 'd784470b-2e2d-528d-9641-b81fd924a4a8'
  },
  ownerId: 'f5fe5c18-fa38-4e1b-b65d-1b214f736987',
  paymentStatus: { name: 'Cancelled as error' },
  remaining: 0,
  status: { name: 'Closed' },
  title: 'A semantic web primer',
  userId: 'bec20636-fb68-41fd-84ea-2cf910673599' }
];

const withStatusOpenRecords = notEmptyRecords.map((item) => (
  item.status.name === 'Closed'
    ? { ...item, status: { name:'Open' } }
    : item
));

const props = {
  stripes: STRIPES,
  loans: okapiLoans,
  mutator: {
    query: {},
    activeRecord: {
      update: jest.fn(),
    },
    anonymize: {
      POST: jest.fn(),
    },
  },
  resources: {
    loanAccount: {
      records: [],
      resource: 'loanAccount',
    },
    query: {},
  },
  match: { params: { id: 'mock-match-params-id' } },
  intl: { formatMessage : jest.fn() },
  user: okapiCurrentUser,
  history,
  location: history.location,
};

const renderClosedLoans = (extraProps = {}) => render(<ClosedLoans {...props} {...extraProps} />);

describe('Given ClosedLoans', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render component', () => {
    renderClosedLoans(props);

    expect(screen.queryByText('ui-users.closedLoansCount')).toBeInTheDocument();
    expect(screen.queryByText('ui-users.anonymize')).toBeInTheDocument();
    expect(screen.queryByText('stripes-components.exportToCsv')).toBeInTheDocument();
    expect(screen.queryByText('ui-users.loans.columns.title')).toBeInTheDocument();
    expect(screen.queryByText('ui-users.loans.columns.dueDate')).toBeInTheDocument();
    expect(screen.queryByText('ui-users.loans.columns.barcode')).toBeInTheDocument();
    expect(screen.queryByText('ui-users.loans.columns.feefineIncurred')).toBeInTheDocument();
    expect(screen.queryByText('ui-users.loans.details.effectiveCallNumber')).toBeInTheDocument();
    expect(screen.queryByText('ui-users.loans.columns.contributors')).toBeInTheDocument();
    expect(screen.queryByText('ui-users.loans.columns.renewals')).toBeInTheDocument();
    expect(screen.queryByText('ui-users.loans.columns.returnDate')).toBeInTheDocument();
    expect(screen.queryByText('ui-users.loans.details.checkinServicePoint')).toBeInTheDocument();
  });

  it('should have action DropdownMenu', () => {
    renderClosedLoans(props);

    expect(screen.queryByText('ui-users.action')).toBeInTheDocument();
  });

  it('should have feeFineDetails button disabled', () => {
    renderClosedLoans(props);

    expect(screen.getByTestId('feeFineDetailsButton')).toBeDisabled();
  });

  it('clicking on a loan row', () => {
    renderClosedLoans();

    userEvent.click(document.querySelector('[data-row-index="row-0"]'));

    expect(nav.onClickViewLoanActionsHistory).toHaveBeenCalledTimes(1);
  });

  it('clicking on a loan column', () => {
    renderClosedLoans({ okapiLoans, sortMap: {} });

    userEvent.click(document.querySelector('[data-test-clickable-header="true"]'));

    expect(calculateSortParams).toHaveBeenCalledTimes(1);
  });

  it('shows up dropdown-menu', () => {
    renderClosedLoans(props);

    const dropdownButton = document.querySelector('[data-test-closed-loans]');

    fireEvent.click(dropdownButton);

    expect(dropdownButton).toBeInTheDocument();
  });

  it('should handle anonymizeLoans with proper params', () => {
    renderClosedLoans(props);

    fireEvent.click(document.querySelector('[id="anonymize-all"]'));

    waitFor(() => {
      expect(mockAnonymizeLoans).toHaveBeenCalled();
    });
  });

  it('should handle effectiveCallNumber', () => {
    renderClosedLoans(props);

    fireEvent.click(screen.queryByText('ui-users.loans.details.effectiveCallNumber'));

    expect(effectiveCallNumber).toHaveBeenCalled();
  });

  describe('when click on newFeeFine button', () => {
    it('fires getChargeFineToLoanPath with proper params', () => {
      renderClosedLoans(props);

      fireEvent.click(screen.queryByText('ui-users.loans.newFeeFine'));

      expect(getChargeFineToLoanPath).toBeCalledWith('mock-match-params-id', 'b6475706-4505-4b20-9ed0-aadcda2b72ee');
    });
  });

  describe('when user has not feesfines.actions.all permission', () => {
    it('should have newFeeFine button disableds', () => {
      const alteredProps = {
        ...props,
        stripes: {
          hasPerm: jest.fn().mockReturnValue(false),
        },
      };

      renderClosedLoans(alteredProps);

      expect(screen.getByTestId('newFeeFineButton')).toBeDisabled();
    });
  });

  describe('when records is no empty', () => {
    it('should have feeFineDetails button enabled', () => {
      const alteredProps = {
        ...props,
        resources: {
          loanAccount: {
            records: notEmptyRecords,
          },
        },
      };

      renderClosedLoans(alteredProps);

      expect(screen.getByTestId('feeFineDetailsButton')).toBeEnabled();
    });
  });

  describe('when click on feeFineDetails button', () => {
    it('fires nav.onClickViewClosedAccounts with proper params', () => {
      const alteredProps = {
        ...props,
        action: 'feefineDetails',
        resources: {
          loanAccount: {
            records: notEmptyRecords,
          },
        },
      };

      renderClosedLoans(alteredProps);

      userEvent.click(screen.getByTestId('feeFineDetailsButton'));

      expect(nav.onClickViewClosedAccounts).toHaveBeenCalledTimes(1);
    });

    it('fires nav.onClickViewOpenAccounts with proper params', () => {
      const alteredProps = {
        ...props,
        action: 'feefineDetails',
        resources: {
          loanAccount: {
            records: withStatusOpenRecords,
          },
        },
      };

      renderClosedLoans(alteredProps);

      userEvent.click(screen.getByTestId('feeFineDetailsButton'));

      expect(nav.onClickViewOpenAccounts).toHaveBeenCalledTimes(1);
    });
  });
});

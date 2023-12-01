/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';
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
import { DCB_VIRTUAL_USER } from '../../../constants';

jest.unmock('@folio/stripes/components');
jest.mock('../../util', () => ({
  ...jest.requireActual('../../util'),
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
jest.mock('@folio/stripes/components', () => ({
  ...jest.requireActual('@folio/stripes/components'),
  ConfirmationModal: jest.fn(({ heading, message, onConfirm, onCancel }) => (
    <div>
      <span>ConfirmationModal</span>
      {heading}
      <div>{message}</div>
      <div>
        <button type="button" onClick={onConfirm}>confirm</button>
        <button type="button" onClick={onCancel}>cancel</button>
      </div>
    </div>
  )),
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

  it('clicking on a loan row', async () => {
    renderClosedLoans();

    await userEvent.click(document.querySelector('[data-row-index="row-0"]'));

    expect(nav.onClickViewLoanActionsHistory).toHaveBeenCalledTimes(1);
  });

  it('clicking on a loan column', async () => {
    renderClosedLoans({ okapiLoans, sortMap: {} });

    await userEvent.click(document.querySelector('[data-test-clickable-header="true"]'));

    expect(calculateSortParams).toHaveBeenCalledTimes(1);
  });

  it('shows up dropdown-menu', () => {
    renderClosedLoans(props);

    const dropdownButton = document.querySelector('[data-test-closed-loans]');

    fireEvent.click(dropdownButton);

    expect(dropdownButton).toBeInTheDocument();
  });

  describe('when click anonymise all button', () => {
    it('should open confirmation modal on clicking "anonymize all" button', () => {
      renderClosedLoans(props);
      fireEvent.click(document.querySelector('[id="anonymize-all"]'));

      expect(screen.getByText('ConfirmationModal')).toBeDefined();
    });

    it('should open confirmation modal with heading "ui-users.anonymization.confirmation.header"', () => {
      renderClosedLoans(props);
      fireEvent.click(document.querySelector('[id="anonymize-all"]'));

      expect(screen.getByText('ui-users.anonymization.confirmation.header')).toBeDefined();
    });

    it('should open confirmation modal with message "ui-users.anonymization.confirmation.message"', () => {
      renderClosedLoans(props);
      fireEvent.click(document.querySelector('[id="anonymize-all"]'));

      expect(screen.getByText('ui-users.anonymization.confirmation.message')).toBeDefined();
    });

    it('should open confirmation modal with confirm button', () => {
      renderClosedLoans(props);
      fireEvent.click(document.querySelector('[id="anonymize-all"]'));

      expect(screen.getByRole('button', { name: /confirm/ })).toBeDefined();
    });

    it('should open confirmation modal with cancel button', () => {
      renderClosedLoans(props);
      fireEvent.click(document.querySelector('[id="anonymize-all"]'));

      expect(screen.getByRole('button', { name: /cancel/ })).toBeDefined();
    });

    // is this a duplicate test???
    // it.skip('should call anonymizeLoans method on clicking confirm button', () => {
    //   renderClosedLoans(props);
    //   fireEvent.click(document.querySelector('[id="anonymize-all"]'));
    //   fireEvent.click(screen.getByRole('button', { name: /confirm/ }));

    //   waitFor(() => {
    //     expect(mockAnonymizeLoans).toHaveBeenCalled();
    //   });
    // });

    it('should close confirmation modal on clicking confirm button', async () => {
      renderClosedLoans(props);
      await userEvent.click(document.querySelector('[id="anonymize-all"]'));
      await userEvent.click(screen.getByRole('button', { name: /confirm/ }));

      waitFor(() => {
        expect(screen.queryByText('ConfirmationModal')).toBe(null);
      });
    });

    it('should close confirmation modal on clicking cancel button', () => {
      renderClosedLoans(props);
      fireEvent.click(document.querySelector('[id="anonymize-all"]'));
      const cancelButton = screen.getByRole('button', { name: /cancel/ });
      fireEvent.click(cancelButton);

      waitFor(() => {
        expect(screen.queryByText('ConfirmationModal')).toBe(null);
      });
    });
  });

  it('should handle anonymizeLoans with proper params', async () => {
    renderClosedLoans(props);

    fireEvent.click(document.querySelector('[id="anonymize-all"]'));
    const confirmButton = screen.getByRole('button', { name: 'confirm' });
    fireEvent.click(confirmButton);

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
    it('fires nav.onClickViewClosedAccounts with proper params', async () => {
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

      await userEvent.click(screen.getByTestId('feeFineDetailsButton'));

      expect(nav.onClickViewClosedAccounts).toHaveBeenCalledTimes(1);
    });

    it('fires nav.onClickViewOpenAccounts with proper params', async () => {
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

      await userEvent.click(screen.getByTestId('feeFineDetailsButton'));

      expect(nav.onClickViewOpenAccounts).toHaveBeenCalledTimes(1);
    });
  });

  describe('when DCB lending role - virtual user and real item', () => {
    const dcbUserProps = {
      ...props,
      user: DCB_VIRTUAL_USER,
    };

    it('should not render "Anonymize all loans" button', () => {
      renderClosedLoans(dcbUserProps);
      expect(screen.queryByRole('button', { name: 'ui-users.anonymize' })).toBeNull();
    });

    it('should not render "Export to csv" button', () => {
      renderClosedLoans(dcbUserProps);
      expect(screen.queryByRole('button', { name: 'stripes-components.exportToCsv' })).toBeNull();
    });
  });

  describe('when DCB borrowing/pickup role - real user and virtual item', () => {
    const dcbItemProps = {
      ...props,
      loans: [
        {
          'id': '42255465-5c4c-40a2-be1c-dbb24a99c581',
          'userId': '23a20881-f1bd-47f7-97b5-b8fbca50a963',
          'itemId': '41ce406c-2a0f-4a2b-b638-7688000b9caf',
          'itemEffectiveLocationIdAtCheckOut': '9d1b77e8-f02e-4b7f-b296-3f2042ddac54',
          'status': {
            'name': 'Closed'
          },
          'loanDate': '2023-11-28T12:21:30.486Z',
          'dueDate': '2023-11-28T12:22:30.486+00:00',
          'returnDate': '2023-11-28T12:21:53.707Z',
          'systemReturnDate': '2023-11-28T12:21:53.623+00:00',
          'action': 'checkedin',
          'loanPolicyId': '26791bfd-70ac-4f5f-a186-29d14b5cf94d',
          'checkoutServicePointId': 'c4c90014-c8c9-4ade-8f24-b5e313319f4b',
          'checkinServicePointId': 'c4c90014-c8c9-4ade-8f24-b5e313319f4b',
          'overdueFinePolicyId': 'cd3f6cac-fa17-4079-9fae-2fb28e521412',
          'lostItemPolicyId': 'ed892c0e-52e0-4cd9-8133-c0ef07b4a709',
          'metadata': {
            'createdDate': '2023-11-28T12:21:32.763+00:00',
            'createdByUserId': '1d435b19-c55a-4b16-a3c3-69b72cc8eeb4',
            'updatedDate': '2023-11-28T12:21:54.017+00:00',
            'updatedByUserId': '1d435b19-c55a-4b16-a3c3-69b72cc8eeb4'
          },
          'patronGroupAtCheckout': {
            'id': '7a4df402-bd0a-4c7a-ae7b-c4a2ae59d7b1',
            'name': 'PT'
          },
          'item': {
            'id': '41ce406c-2a0f-4a2b-b638-7688000b9caf',
            'holdingsRecordId': '10cd3a5a-d36f-4c7a-bc4f-e1ae3cf820c9',
            'instanceId': '9d1b77e4-f02e-4b7f-b296-3f2042ddac54',
            'title': 'DCB_INSTANCE',
            'barcode': 'abc202311281',
            'status': {
              'name': 'In transit',
              'date': '2023-11-30T11:20:41.154+00:00'
            },
            'location': {
              'name': 'DCB'
            },
            'materialType': {
              'name': 'book'
            }
          },
          'checkinServicePoint': {
            'name': 'Circ Desk 2',
            'code': 'cd2',
            'discoveryDisplayName': 'Circulation Desk -- Back Entrance',
            'description': null,
            'shelvingLagTime': null,
            'pickupLocation': true
          },
          'checkoutServicePoint': {
            'name': 'Circ Desk 2',
            'code': 'cd2',
            'discoveryDisplayName': 'Circulation Desk -- Back Entrance',
            'description': null,
            'shelvingLagTime': null,
            'pickupLocation': true
          },
          'borrower': {
            'firstName': '',
            'lastName': 'dcbB1',
            'middleName': null,
            'barcode': 'dcbB1'
          },
          'loanPolicy': {
            'name': 'One minute Loan Policy'
          },
          'overdueFinePolicy': {
            'name': 'Overdue fine policy'
          },
          'lostItemPolicy': {
            'name': 'Lost item fee policy'
          },
          'feesAndFines': {
            'amountRemainingToPay': 0
          }
        },
      ],
    };

    it('should not render "Item details" menu item in action drop down menu', () => {
      renderClosedLoans(dcbItemProps);
      expect(screen.queryByText('ui-users.itemDetails')).toBeNull();
    });
  });

  describe('when DCB pickup role - virtual user and virtual item', () => {
    const dcbProps = {
      ...props,
      user: DCB_VIRTUAL_USER,
      loans: [
        {
          'id': '42255465-5c4c-40a2-be1c-dbb24a99c581',
          'userId': '23a20881-f1bd-47f7-97b5-b8fbca50a963',
          'itemId': '41ce406c-2a0f-4a2b-b638-7688000b9caf',
          'itemEffectiveLocationIdAtCheckOut': '9d1b77e8-f02e-4b7f-b296-3f2042ddac54',
          'status': {
            'name': 'Closed'
          },
          'loanDate': '2023-11-28T12:21:30.486Z',
          'dueDate': '2023-11-28T12:22:30.486+00:00',
          'returnDate': '2023-11-28T12:21:53.707Z',
          'systemReturnDate': '2023-11-28T12:21:53.623+00:00',
          'action': 'checkedin',
          'loanPolicyId': '26791bfd-70ac-4f5f-a186-29d14b5cf94d',
          'checkoutServicePointId': 'c4c90014-c8c9-4ade-8f24-b5e313319f4b',
          'checkinServicePointId': 'c4c90014-c8c9-4ade-8f24-b5e313319f4b',
          'overdueFinePolicyId': 'cd3f6cac-fa17-4079-9fae-2fb28e521412',
          'lostItemPolicyId': 'ed892c0e-52e0-4cd9-8133-c0ef07b4a709',
          'metadata': {
            'createdDate': '2023-11-28T12:21:32.763+00:00',
            'createdByUserId': '1d435b19-c55a-4b16-a3c3-69b72cc8eeb4',
            'updatedDate': '2023-11-28T12:21:54.017+00:00',
            'updatedByUserId': '1d435b19-c55a-4b16-a3c3-69b72cc8eeb4'
          },
          'patronGroupAtCheckout': {
            'id': '7a4df402-bd0a-4c7a-ae7b-c4a2ae59d7b1',
            'name': 'PT'
          },
          'item': {
            'id': '41ce406c-2a0f-4a2b-b638-7688000b9caf',
            'holdingsRecordId': '10cd3a5a-d36f-4c7a-bc4f-e1ae3cf820c9',
            'instanceId': '9d1b77e4-f02e-4b7f-b296-3f2042ddac54',
            'title': 'DCB_INSTANCE',
            'barcode': 'abc202311281',
            'status': {
              'name': 'In transit',
              'date': '2023-11-30T11:20:41.154+00:00'
            },
            'location': {
              'name': 'DCB'
            },
            'materialType': {
              'name': 'book'
            }
          },
          'checkinServicePoint': {
            'name': 'Circ Desk 2',
            'code': 'cd2',
            'discoveryDisplayName': 'Circulation Desk -- Back Entrance',
            'description': null,
            'shelvingLagTime': null,
            'pickupLocation': true
          },
          'checkoutServicePoint': {
            'name': 'Circ Desk 2',
            'code': 'cd2',
            'discoveryDisplayName': 'Circulation Desk -- Back Entrance',
            'description': null,
            'shelvingLagTime': null,
            'pickupLocation': true
          },
          'borrower': {
            'firstName': '',
            'lastName': 'dcbB1',
            'middleName': null,
            'barcode': 'dcbB1'
          },
          'loanPolicy': {
            'name': 'One minute Loan Policy'
          },
          'overdueFinePolicy': {
            'name': 'Overdue fine policy'
          },
          'lostItemPolicy': {
            'name': 'Lost item fee policy'
          },
          'feesAndFines': {
            'amountRemainingToPay': 0
          }
        },
      ],
    };
    it('should not render "Anonymize all loans" button', () => {
      renderClosedLoans(dcbProps);
      // expect(screen.queryByText('ui-users.anonymize')).toBeNull();
      expect(screen.queryByRole('button', { name: 'ui-users.anonymize' })).toBeNull();
    });
    it('should not render "Export to csv" button', () => {
      renderClosedLoans(dcbProps);
      // expect(screen.queryByText('stripes-components.exportToCsv')).toBeNull();
      expect(screen.queryByRole('button', { name: 'stripes-components.exportToCsv' })).toBeNull();
    });
    it('should not render actions column', () => {
      renderClosedLoans(dcbProps);
    });
  });
});

import okapiCurrentUser from 'fixtures/okapiCurrentUser';
import {
  screen,
  fireEvent,
} from '@testing-library/react';

import renderWithRouter from 'helpers/renderWithRouter';
import loans from 'fixtures/openLoans';

import OpenLoansSubHeader from './OpenLoansSubHeader';

jest.unmock('@folio/stripes/components');

const renderOpenLoansSubHeader = (props) => renderWithRouter(<OpenLoansSubHeader {...props} />);

const buildRecords = jest.fn();
const openBulkClaimReturnedModal = jest.fn();
const openPatronBlockedModal = jest.fn();
const renewSelected = jest.fn();
const showChangeDueDateDialog = jest.fn();
const toggleColumn = jest.fn();

const nonEmptyCheckedLoans = {
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
      title: 'Bridget Jones the diaries',
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

const nonEmptyPatronBlocks = [{
  borrowing: true,
  desc: 'Sample',
  id: 'f1e0d3e2-fa48-4a82-b371-bea4e44178ab',
  patronMessage: '',
  renewals: true,
  requests: true,
  staffInformation: '',
  type: 'Manual',
  userId: 'e6dc87a3-591b-43e0-a768-d3552b44878b',
  metadata: { createdDate: '2022-03-01T03:22:48.262+00:00', updatedDate: '2022-03-01T03:22:48.262+00:00' }
}];

const columnMapping = {
  barcode: 'Barcode',
  dueDate: 'Due date',
  location: 'Location',
  requests: 'Requests',
  title: 'Item title',
};

const visibleColumns = [
  { title: 'title', status: true },
  { title: 'requests', status: true },
  { title: 'barcode', status: true },
];


const dropdownOptions = visibleColumns.filter((columnObj) => Object.keys(columnMapping)
  .includes(columnObj.title))
  .map((e) => columnMapping[e.title]);

const props = {
  buildRecords,
  checkedLoans: {},
  columnMapping,
  loans,
  openBulkClaimReturnedModal,
  openPatronBlockedModal,
  patronBlocks: [],
  renewSelected,
  showChangeDueDateDialog,
  toggleColumn,
  user: okapiCurrentUser,
  visibleColumns,
};

describe('Given OpenLoansSubHeader', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render component', () => {
    renderOpenLoansSubHeader(props);

    expect(screen.getByText('ui-users.resultCount')).toBeDefined();
    expect(screen.getByTestId('columnsDropdown')).toBeDefined();
    expect(screen.getByRole('button', { name: 'ui-users.renew' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'ui-users.loans.claimReturned' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'stripes-smart-components.cddd.changeDueDate' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'stripes-components.exportToCsv' })).toBeDefined();
  });

  it('should have Renew, Claim returned, and Change due date buttons disabled', () => {
    renderOpenLoansSubHeader(props);

    expect(screen.getByRole('button', { name: 'ui-users.renew' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'ui-users.loans.claimReturned' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'stripes-smart-components.cddd.changeDueDate' })).toBeDisabled();
  });

  it('should display visible columns in dropdown options', () => {
    renderOpenLoansSubHeader(props);

    fireEvent.click(screen.getByRole('button', { name: 'Icon' }));

    dropdownOptions.forEach((option) => {
      expect(screen.getByText(option)).toBeDefined();
    });
  });

  it('should have all visible columns checked', () => {
    renderOpenLoansSubHeader(props);

    fireEvent.click(screen.getByRole('button', { name: 'Icon' }));

    dropdownOptions.forEach((option) => {
      expect(screen.getByRole('checkbox', { name: option })).toBeChecked();
    });
  });

  describe('when click on visible columns dropdown option', () => {
    it('should handle toggleColumn', () => {
      renderOpenLoansSubHeader(props);

      fireEvent.click(screen.getByRole('button', { name: 'Icon' }));
      fireEvent.click(screen.getByRole('checkbox', { name: 'Item title' }));

      expect(toggleColumn).toHaveBeenCalledWith('title');
    });
  });

  describe('when there is a loan with status Claimed returned', () => {
    it('should display a number of loans claimed returned', () => {
      const [firstLoan] = loans;
      const alteredProps = {
        ...props,
        loans: [{
          ...firstLoan,
          item: {
            ...firstLoan.item,
            status: {
              ...firstLoan.item.status,
              name: 'Claimed returned',
            },
          },
        }],
      };

      renderOpenLoansSubHeader(alteredProps);

      expect(screen.getByText(/ui-users.loans.numClaimedReturnedLoans/)).toBeDefined();
    });
  });

  describe('when there are selected loans and user is active', () => {
    it('should enable Renew, Claim returned, and Change due date buttons', () => {
      const alteredProps = {
        ...props,
        checkedLoans: nonEmptyCheckedLoans,
        user: {
          ...okapiCurrentUser,
          expirationDate: null,
          active: true,
        },
      };

      renderOpenLoansSubHeader(alteredProps);

      expect(screen.getByRole('button', { name: 'ui-users.renew' })).toBeEnabled();
      expect(screen.getByRole('button', { name: 'ui-users.loans.claimReturned' })).toBeEnabled();
      expect(screen.getByRole('button', { name: 'stripes-smart-components.cddd.changeDueDate' })).toBeEnabled();
    });
  });

  describe('when click on enabled Renew button', () => {
    describe('when there are no renewal patron blocks', () => {
      it('should handle renewSelected', () => {
        const alteredProps = {
          ...props,
          checkedLoans: nonEmptyCheckedLoans,
          user: {
            ...okapiCurrentUser,
            expirationDate: null,
            active: true,
          },
        };

        renderOpenLoansSubHeader(alteredProps);

        fireEvent.click(screen.getByRole('button', { name: 'ui-users.renew' }));

        expect(renewSelected).toHaveBeenCalled();
      });
    });

    describe('when there are renewal patron blocks', () => {
      it('should handle openPatronBlockedModal', () => {
        const alteredProps = {
          ...props,
          checkedLoans: nonEmptyCheckedLoans,
          patronBlocks: nonEmptyPatronBlocks,
          user: {
            ...okapiCurrentUser,
            expirationDate: null,
            active: true,
          },
        };

        renderOpenLoansSubHeader(alteredProps);

        fireEvent.click(screen.getByRole('button', { name: 'ui-users.renew' }));

        expect(openPatronBlockedModal).toHaveBeenCalled();
      });
    });
  });

  describe('when click on enabled Claim returned button', () => {
    it('should handle openBulkClaimReturnedModal', () => {
      const alteredProps = {
        ...props,
        checkedLoans: nonEmptyCheckedLoans,
      };

      renderOpenLoansSubHeader(alteredProps);

      fireEvent.click(screen.getByRole('button', { name: 'ui-users.loans.claimReturned' }));

      expect(openBulkClaimReturnedModal).toHaveBeenCalled();
    });
  });

  describe('when click on enabled Change due date button', () => {
    it('should handle showChangeDueDateDialog', () => {
      const alteredProps = {
        ...props,
        checkedLoans: nonEmptyCheckedLoans,
      };

      renderOpenLoansSubHeader(alteredProps);

      fireEvent.click(screen.getByRole('button', { name: 'stripes-smart-components.cddd.changeDueDate' }));

      expect(showChangeDueDateDialog).toHaveBeenCalled();
    });
  });
});

import React from 'react';
import { screen, waitFor, within } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';
import { createMemoryHistory } from 'history';
import renderWithRouter from 'helpers/renderWithRouter';
import { nav } from '../../util';
import ViewFeesFines from './ViewFeesFines';

jest.unmock('@folio/stripes/components');
jest.mock('../../util', () => ({
  ...jest.requireActual('../../util'),
  isRefundAllowed: jest.fn().mockReturnValue(true),
  nav: {
    onClickViewLoanActionsHistory: jest.fn(),
  }
}));
jest.mock('react-intl', () => ({
  ...jest.requireActual('react-intl'),
  FormattedMessage: jest.fn(({ id }) => id),
  FormattedTime: jest.fn(({ value }) => value),
  FormattedDate: jest.fn(({ value }) => value),
}));

const spyFn = jest.spyOn(require('../../util'), 'calculateSortParams');

const history = createMemoryHistory();
const mockOnChangeActions = jest.fn();
const STRIPES = {
  config: {},
  hasPerm: jest.fn().mockReturnValue(true),
};

const accountsData = [
  {
    amount: 5,
    barcode: 'testCode',
    callNumber: '11223322',
    dueDate: '2023-04-06T04:52:19.214+00:00',
    feeFineOwner: 'TestOwner',
    feeFineType: 'Test Feefine type',
    loanId: 1,
    metadata: {
      createdDate: '2022-01-06T04:52:19.214+00:00',
      updatedDate: '2023-11-12T04:52:19.214+00:00',
    },
    paymentStatus: { name: 'Outstanding' },
    remaining: 5,
    returnedDate: '2023-04-06T04:52:19.214+00:00',
    rowIndex: 0,
    status: {
      name: 'Open'
    },
    title: 'Test Title',
  },
];

const accountsDataProps = [
  {
    amount: 5,
    barcode: '4444',
    callNumber: '11223322',
    dueDate: '2023-04-06T04:52:19.214+00:00',
    feeFineOwner: 'Owner 2',
    feeFineType: 'Test Feefine type',
    loanId: 1,
    metadata: {
      createdDate: '2022-01-06T04:52:19.214+00:00',
      updatedDate: '2023-11-12T04:52:19.214+00:00',
    },
    paymentStatus: { name: 'Outstanding' },
    remaining: 5,
    returnedDate: '2023-04-06T04:52:19.214+00:00',
    rowIndex: 0,
    status: {
      name: 'Open'
    },
    title: 'Test Title',
  },
  {
    amount: 100,
    barcode: '5555',
    callNumber: '4444444',
    dueDate: '2024-04-10T04:52:19.214+00:00',
    feeFineOwner: 'Owner 1',
    feeFineType: 'Test Feefine type',
    loanId: 1,
    metadata: {
      createdDate: '2024-01-06T04:52:19.214+00:00',
      updatedDate: '2024-11-12T04:52:19.214+00:00',
    },
    paymentStatus: { name: 'Outstanding' },
    remaining: 5,
    returnedDate: '2024-10-10T04:52:19.214+00:00',
    rowIndex: 0,
    status: {
      name: 'Open'
    },
    title: 'Test Title 2',
  },
];

const defaultProps = {
  resources: {
    comments: {
      records: [
        {
          id: 1,
          dateAction: '2023-10-6',
          comments: 'comment 1'
        },
        {
          id: 2,
          dateAction: '2023-11-6',
          comments: 'comment 2'
        }
      ]
    },
    loans: {
      records: [{}]
    }
  },
  mutator: {
    activeRecord: {
      update: jest.fn()
    }
  },
  stripes: STRIPES,
  onChangeActions: mockOnChangeActions,
  onChangeSelected: jest.fn(),
  accounts: accountsData,
  feeFineActions: [{}],
  loans: [
    {
      id: 1
    }
  ],
  match: { params: { id: 1 } },
  history,
  user: { id: '123' },
  visibleColumns: ['  ', 'metadata.createdDate', 'metadata.updatedDate', 'feeFineType', 'amount', 'remaining', 'paymentStatus.name', 'feeFineOwner', 'title', 'barcode', 'callNumber', 'dueDate', 'returnedDate', ' '],
  intl: {
    formatMessage: ({ id }) => id
  },
  selectedAccounts: [{ id: 1 }, { id: 2 }],
};

const renderViewFeesFines = (props) => renderWithRouter(<ViewFeesFines {...props} />);

describe('ViewFeesFines', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('Component should render properly', () => {
    renderViewFeesFines(defaultProps);
    expect(screen.getByText('ui-users.accounts.history.columns.created')).toBeInTheDocument();
    expect(screen.getByText('ui-users.accounts.history.columns.updated')).toBeInTheDocument();
    expect(screen.getByText('ui-users.accounts.history.columns.type')).toBeInTheDocument();
    expect(screen.getByText('ui-users.accounts.history.columns.amount')).toBeInTheDocument();
    expect(screen.getByText('ui-users.accounts.history.columns.remaining')).toBeInTheDocument();
    expect(screen.getByText('ui-users.accounts.history.columns.owner')).toBeInTheDocument();
    expect(screen.getByText('ui-users.accounts.history.columns.title')).toBeInTheDocument();
    expect(screen.getByText('ui-users.accounts.history.columns.due')).toBeInTheDocument();
  });
  it('onChangeActions to be called checkBox checked', () => {
    renderViewFeesFines(defaultProps);
    const checkBox = screen.getAllByRole('checkbox', { name: '' });
    userEvent.click(checkBox[0]);
    expect(mockOnChangeActions).toHaveBeenCalledTimes(1);
    userEvent.click(checkBox[1]);
    expect(mockOnChangeActions).toHaveBeenCalledTimes(2);
  });
  it('OnChangeActions to be called with different parmeter when DropDownMenu Buttons are clicked', () => {
    renderViewFeesFines(defaultProps);
    const checkBox = screen.getAllByRole('checkbox', { name: '' });
    userEvent.click(checkBox[1]);
    userEvent.click(screen.queryByText(/ui-users.accounts.history.button.pay/i));
    expect(mockOnChangeActions).toHaveBeenCalledWith({ pay: true }, accountsData);
    userEvent.click(screen.queryByText(/ui-users.accounts.history.button.waive/i));
    expect(mockOnChangeActions).toHaveBeenCalledWith({ waiveModal: true }, accountsData);
    userEvent.click(screen.queryByText(/ui-users.accounts.history.button.refund/i));
    expect(mockOnChangeActions).toHaveBeenCalledWith({ refundModal: true }, accountsData);
    userEvent.click(screen.queryByText(/ui-users.accounts.history.button.transfer/i));
    expect(mockOnChangeActions).toHaveBeenCalledWith({ transferModal: true }, accountsData);
    userEvent.click(screen.queryByText(/ui-users.accounts.button.error/i));
    expect(mockOnChangeActions).toHaveBeenCalledWith({ cancellation: true }, accountsData);
    userEvent.click(screen.queryByText(/ui-users.accounts.history.button.loanDetails/i));
    expect(nav.onClickViewLoanActionsHistory).toBeCalled();
  });
  it('onClickViewLoanActionsHistory to be called when loanDetails clicked from DropDownMenu', () => {
    renderViewFeesFines(defaultProps);
    const checkBox = screen.getAllByRole('checkbox', { name: '' });
    userEvent.click(checkBox[1]);
    userEvent.click(screen.queryByText(/ui-users.accounts.history.button.loanDetails/i));
    expect(nav.onClickViewLoanActionsHistory).toBeCalled();
  });
  it('Rows should render in Descending Order of created date value and on clicking createdDate header sort order to be reversed', async () => {
    renderViewFeesFines({ ...defaultProps, accounts : accountsDataProps });
    let rows = screen.getAllByRole('row');
    expect(within(rows[1]).getByText('2024-01-06T04:52:19.214+00:00')).toBeInTheDocument();
    expect(within(rows[2]).getByText('2022-01-06T04:52:19.214+00:00')).toBeInTheDocument();
    userEvent.click(screen.getByRole('button', { name: 'ui-users.accounts.history.columns.created' }));
    rows = screen.getAllByRole('row');
    await waitFor(() => {
      expect(within(rows[1]).getByText('2022-01-06T04:52:19.214+00:00')).toBeInTheDocument();
      expect(within(rows[2]).getByText('2024-01-06T04:52:19.214+00:00')).toBeInTheDocument();
    });
  });
  it('calculateSortParams should be called on clicking column headers', () => {
    renderViewFeesFines({ ...defaultProps, accounts : accountsDataProps });
    userEvent.click(screen.getByRole('button', { name: 'ui-users.accounts.history.columns.updated' }));
    expect(spyFn).toBeCalledTimes(1);
    userEvent.click(screen.getByRole('button', { name: 'ui-users.accounts.history.columns.type' }));
    expect(spyFn).toBeCalledTimes(2);
    userEvent.click(screen.getByRole('button', { name: 'ui-users.accounts.history.columns.amount' }));
    expect(spyFn).toBeCalledTimes(3);
    userEvent.click(screen.getByRole('button', { name: 'ui-users.accounts.history.columns.remaining' }));
    expect(spyFn).toBeCalledTimes(4);
    userEvent.click(screen.getByRole('button', { name: 'ui-users.accounts.history.columns.status' }));
    expect(spyFn).toBeCalledTimes(5);
    userEvent.click(screen.getByRole('button', { name: 'ui-users.accounts.history.columns.owner' }));
    expect(spyFn).toBeCalledTimes(6);
    userEvent.click(screen.getByRole('button', { name: 'ui-users.accounts.history.columns.title' }));
    expect(spyFn).toBeCalledTimes(7);
    userEvent.click(screen.getByRole('button', { name: 'ui-users.accounts.history.columns.barcode' }));
    expect(spyFn).toBeCalledTimes(8);
    userEvent.click(screen.getByRole('button', { name: 'ui-users.accounts.history.columns.due' }));
    expect(spyFn).toBeCalledTimes(9);
    userEvent.click(screen.getByRole('button', { name: 'ui-users.accounts.history.columns.returned' }));
    expect(spyFn).toBeCalledTimes(10);
  });
});

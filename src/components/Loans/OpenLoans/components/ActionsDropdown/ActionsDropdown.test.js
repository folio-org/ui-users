import { screen, fireEvent } from '@testing-library/react';

import renderWithRouter from 'helpers/renderWithRouter';

import { IfPermission } from '@folio/stripes/core';

import okapiCurrentUser from 'fixtures/okapiCurrentUser';
import okapiOpenLoan from 'fixtures/openLoan';

import buildStripes from '__mock__/stripes.mock';

import ActionsDropdown from './ActionsDropdown';

import { itemStatuses } from '../../../../../constants';

const mockHandleOptionsChange = jest.fn();

jest.unmock('@folio/stripes/components');
jest.unmock('@folio/stripes/smart-components');

jest.mock('../../../../util', () => {
  return {
    ...jest.requireActual('../../../../util'),
    checkUserActive: jest.fn().mockReturnValue(true),
  };
});

beforeEach(() => {
  mockHandleOptionsChange.mockClear();
});

const renderActionsDropdown = (props) => renderWithRouter(<ActionsDropdown {...props} />);

const props = {
  stripes: buildStripes({ hasPerm: jest.fn().mockReturnValue(true) }),
  loan: okapiOpenLoan,
  requestQueue: true,
  itemRequestCount: 0,
  handleOptionsChange: mockHandleOptionsChange,
  disableFeeFineDetails: false,
  match: { params: { id: 'mock-match-params-id' } },
  intl: { formatMessage : jest.fn() },
  user: okapiCurrentUser,
};

describe('ActoinsDropdown component', () => {
  beforeEach(() => {
    IfPermission.mockImplementation(({ children }) => children);
  });

  it('renders properly', () => {
    renderActionsDropdown(props);
    expect(screen.getByTestId('actions-dropdown-test-id')).toBeInTheDocument();
  });

  it('renders all specified buttons', () => {
    renderActionsDropdown(props);

    expect(screen.queryByText('ui-users.itemDetails')).toBeInTheDocument();
    expect(screen.queryByText('ui-users.renew')).toBeInTheDocument();
    expect(screen.queryByText('ui-users.loans.claimReturned')).toBeInTheDocument();
    expect(screen.queryByText('stripes-smart-components.cddd.changeDueDate')).toBeInTheDocument();
    expect(screen.queryByText('ui-users.loans.declareLost')).toBeInTheDocument();
    expect(screen.queryByText('ui-users.loans.details.loanPolicy')).toBeInTheDocument();
    expect(screen.queryByText('ui-users.loans.newFeeFine')).toBeInTheDocument();
    expect(screen.queryByText('ui-users.loans.feeFineDetails')).toBeInTheDocument();
    expect(screen.queryByText('ui-users.loans.details.requestQueue')).toBeInTheDocument();
  });

  describe('when loan-item-status is Claimed returned', () => {
    const propsWithClaimedReturned = {
      ...props,
      loan: {
        ...okapiOpenLoan,
        item: {
          ...okapiOpenLoan.item,
          status: {
            ...okapiOpenLoan.item.status,
            name: itemStatuses.CLAIMED_RETURNED,
          },
        },
      },
    };

    it('renders Mark As Missing button', () => {
      renderActionsDropdown(propsWithClaimedReturned);

      expect(screen.queryByText('ui-users.loans.markAsMissing')).toBeInTheDocument();
    });

    describe('when click', () => {
      it('fires handleOptionsChange with proper params', () => {
        renderActionsDropdown(propsWithClaimedReturned);

        fireEvent.click(screen.queryByText('ui-users.loans.markAsMissing'));

        expect(mockHandleOptionsChange).toBeCalledWith({
          loan: propsWithClaimedReturned.loan,
          action:'markAsMissing',
          itemRequestCount: propsWithClaimedReturned.itemRequestCount,
        });
      });
    });
  });

  describe('when click on dropdown button', () => {
    it('shows up dropdown-menu', () => {
      renderActionsDropdown(props);

      const dropdownButton = screen.getByTestId('actions-dropdown-test-id').querySelector('button');

      fireEvent.click(dropdownButton);
      expect(dropdownButton).toHaveAttribute('aria-expanded', 'true');
    });

    describe('when click on Renew button', () => {
      it('fires handleOptionsChange with proper params', () => {
        renderActionsDropdown(props);

        fireEvent.click(screen.queryByText('ui-users.renew'));

        expect(mockHandleOptionsChange).toBeCalledWith({ loan: props.loan, action: 'renew' });
      });
    });

    describe('when click on Claim Returned button', () => {
      it('fires handleOptionsChange with proper params', () => {
        renderActionsDropdown(props);

        fireEvent.click(screen.queryByText('ui-users.loans.claimReturned'));

        expect(mockHandleOptionsChange).toBeCalledWith({ loan: props.loan, action: 'claimReturned', itemRequestCount: props.itemRequestCount });
      });
    });

    describe('when click on Change Due Date button', () => {
      it('fires handleOptionsChange with proper params', () => {
        renderActionsDropdown(props);

        fireEvent.click(screen.queryByText('stripes-smart-components.cddd.changeDueDate'));

        expect(mockHandleOptionsChange).toBeCalledWith({ loan: props.loan, action: 'changeDueDate' });
      });
    });

    describe('when click on Declare Lost button', () => {
      it('fires handleOptionsChange with proper params', () => {
        renderActionsDropdown(props);

        fireEvent.click(screen.queryByText('ui-users.loans.declareLost'));

        expect(mockHandleOptionsChange).toBeCalledWith({ loan: props.loan, action:'declareLost', itemRequestCount: props.itemRequestCount });
      });
    });

    describe('when click on Fee Fine Details button', () => {
      it('fires getChargeFineToLoanPath with proper params', () => {
        renderActionsDropdown(props);

        fireEvent.click(screen.queryByText('ui-users.loans.feeFineDetails'));

        expect(mockHandleOptionsChange).toBeCalledWith({ loan: props.loan, action: 'feefineDetails' });
      });
    });
  });
});

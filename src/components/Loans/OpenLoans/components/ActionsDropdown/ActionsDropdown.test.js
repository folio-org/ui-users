import { QueryClient, QueryClientProvider } from 'react-query';

import { screen, fireEvent } from '@folio/jest-config-stripes/testing-library/react';

import renderWithRouter from 'helpers/renderWithRouter';

import { IfPermission } from '@folio/stripes/core';
import okapiCurrentUser from 'fixtures/okapiCurrentUser';

import okapiOpenLoan from 'fixtures/openLoan';

import buildStripes from '__mock__/stripes.mock';

import ActionsDropdown from './ActionsDropdown';
import {
  itemStatuses,
  DCB,
  DCB_VIRTUAL_USER,
  DCB_HOLDINGS_RECORD_ID,
  DCB_INSTANCE_ID,
} from '../../../../../constants';
import useStaffSlips from '../../../../../hooks/useStaffSlips';

const mockHandleOptionsChange = jest.fn();

jest.unmock('@folio/stripes/components');
jest.unmock('@folio/stripes/smart-components');

jest.mock('../../../../util', () => {
  return {
    ...jest.requireActual('../../../../util'),
    checkUserActive: jest.fn().mockReturnValue(true),
  };
});

jest.mock('../../../../../hooks/useStaffSlips');

beforeEach(() => {
  mockHandleOptionsChange.mockClear();
});

const queryClient = new QueryClient();

const renderActionsDropdown = (props) => renderWithRouter(
  <QueryClientProvider client={queryClient}>
    <ActionsDropdown {...props} />
  </QueryClientProvider>
);

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

    useStaffSlips.mockReturnValue({
      staffSlips: [
        {
          id: '0b52bca7-db17-4e91-a740-7872ed6d7323',
          name: 'Due date receipt',
          active: true,
          template: '<p>template values</p>'
        }
      ]
    })
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

  describe('when dcb lending role', () => {
    it('render only item details button', () => {
      const alteredProps = {
        ...props,
        user: {
          ...okapiCurrentUser,
          lastName: DCB_VIRTUAL_USER.personal.lastName,
          type: DCB,
        }
      };
      renderActionsDropdown(alteredProps);

      expect(screen.queryByText('ui-users.itemDetails')).toBeInTheDocument();
      expect(screen.queryByText('ui-users.renew')).toBeNull();
      expect(screen.queryByText('ui-users.loans.claimReturned')).toBeNull();
      expect(screen.queryByText('stripes-smart-components.cddd.changeDueDate')).toBeNull();
      expect(screen.queryByText('ui-users.loans.declareLost')).toBeNull();
      expect(screen.queryByText('ui-users.loans.details.loanPolicy')).toBeNull();
      expect(screen.queryByText('ui-users.loans.newFeeFine')).toBeNull();
      expect(screen.queryByText('ui-users.loans.feeFineDetails')).toBeNull();
      expect(screen.queryByText('ui-users.loans.details.requestQueue')).toBeNull();
    });
  });

  describe('when dcb borrowing role', () => {
    it('render only item details button', () => {
      const alteredProps = {
        ...props,
        loan: {
          ...okapiOpenLoan,
          item: {
            instanceId: DCB_INSTANCE_ID,
            holdingsRecordId: DCB_HOLDINGS_RECORD_ID,
          },
        }
      };
      renderActionsDropdown(alteredProps);

      expect(screen.queryByText('ui-users.itemDetails')).toBeNull();
      expect(screen.queryByText('ui-users.renew')).toBeInTheDocument();
      expect(screen.queryByText('ui-users.loans.claimReturned')).toBeInTheDocument();
      expect(screen.queryByText('stripes-smart-components.cddd.changeDueDate')).toBeInTheDocument();
      expect(screen.queryByText('ui-users.loans.declareLost')).toBeInTheDocument();
      expect(screen.queryByText('ui-users.loans.details.loanPolicy')).toBeInTheDocument();
      expect(screen.queryByText('ui-users.loans.newFeeFine')).toBeInTheDocument();
      expect(screen.queryByText('ui-users.loans.feeFineDetails')).toBeInTheDocument();
      expect(screen.queryByText('ui-users.loans.details.requestQueue')).toBeInTheDocument();
    });
  });
});

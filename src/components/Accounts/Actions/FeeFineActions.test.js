import React from 'react';
import { Router } from 'react-router';
import { createMemoryHistory } from 'history';
import {
  render,
  screen,
  waitFor,
  fireEvent,
} from '@testing-library/react';

import '../../../../test/jest/__mock__';

import FeeFineActions from './FeeFineActions';
import CommentModal from './CommentModal';

jest.mock('./CancellationModal', () => jest.fn(() => null));
jest.mock('./CommentModal', () => jest.fn(() => null));
jest.mock('./WarningModal', () => jest.fn(() => null));
jest.mock('./ActionModal', () => jest.fn(() => null));

describe('FeeFineActions', () => {
  const mockedMutator = {
    user: {
      update: jest.fn(),
    },
    activeRecord: {
      update: jest.fn(),
    },
    accounts: {
      PUT: jest.fn(() => new Promise(res => res())),
    },
    feefineactions: {
      POST: jest.fn(),
    },
    pay: {
      POST: jest.fn(),
    },
    waive: {
      POST: jest.fn(),
    },
    transfer: {
      POST: jest.fn(),
    },
    cancel: {
      POST: jest.fn(),
    },
    refund: {
      POST: jest.fn(),
    },
    bulkPay: {
      POST: jest.fn(),
    },
    bulkWaive: {
      POST: jest.fn(),
    },
    bulkTransfer: {
      POST: jest.fn(),
    },
    bulkRefund: {
      POST: jest.fn(),
    },
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
  const mockedActions = {
    regular: true,
  };
  const mockedUser = {
    id: 'userId',
    firstName: 'userFirstName',
    lastName: 'userLastName',
  };
  const mockedHandleEdit = jest.fn(() => new Promise(res => res()));
  const mockedOnChangeActions = jest.fn();
  const mockedHistory = createMemoryHistory();
  const defaultProps = {
    user: mockedUser,
    actions: mockedActions,
    okapi: mockedOkapi,
    mutator: mockedMutator,
    handleEdit: mockedHandleEdit,
    onChangeActions: mockedOnChangeActions,
  };

  afterEach(() => {
    CommentModal.mockClear();
    mockedMutator.activeRecord.update.mockClear();
    mockedMutator.feefineactions.POST.mockClear();
    mockedMutator.accounts.PUT.mockClear();
    mockedHandleEdit.mockClear();
    mockedOnChangeActions.mockClear();
  });

  describe('CommentModal', () => {
    const labelIds = {
      tagStaff: 'ui-users.accounts.actions.tag.staff',
      staffInfo: 'ui-users.accounts.comment.staffInfo',
    };
    const mockedAccount = {
      id: 'accountId',
      amount: 4321,
      remaining: 1234,
      paymentStatus: {
        name: 'paymentStatusName',
      },
      status: {
        name: 'statusName',
      },
      metadata: {},
    };
    const mockedAccounts = [
      mockedAccount,
    ];
    const commentModalLabel = 'Comment Modal';
    const mockedComment = 'testComment';

    beforeAll(() => {
      CommentModal.mockImplementation(({
        onSubmit,
      }) => {
        return (
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
          <div onClick={() => onSubmit({ ...mockedAccount, comment: mockedComment })}>{commentModalLabel}</div>
        );
      });
    });

    beforeEach(() => {
      render(
        <Router history={mockedHistory}>
          <FeeFineActions
            {...defaultProps}
            accounts={mockedAccounts}
            actions={{
              ...mockedActions,
              comment: true,
            }}
          />
        </Router>
      );
    });

    afterAll(() => {
      CommentModal.mockImplementation(() => null);
    });

    it('should render "CommentModal"', () => {
      expect(screen.getByText(commentModalLabel)).toBeInTheDocument();
    });

    it('should correctly handle submit action', async () => {
      fireEvent.click(screen.getByText(commentModalLabel));

      await waitFor(() => expect(mockedMutator.activeRecord.update).toHaveBeenCalledWith({ id: mockedAccount.id }));
      await waitFor(() => expect(mockedMutator.feefineactions.POST).toHaveBeenLastCalledWith(expect.objectContaining({
        typeAction: labelIds.staffInfo,
        source: `${mockedCurrentUser.lastName}, ${mockedCurrentUser.firstName}`,
        createdAt: mockedCurServicePoint.id,
        accountId: mockedAccount.id,
        userId: mockedUser.id,
        amountAction: parseFloat(0).toFixed(2),
        balance: parseFloat(mockedAccount.remaining).toFixed(2),
        transactionInformation: '',
        comments: `${labelIds.tagStaff} : ${mockedComment}`,
      })));
      await waitFor(() => expect(mockedMutator.accounts.PUT).toHaveBeenCalledWith(expect.objectContaining({
        amount: mockedAccount.amount,
        id: mockedAccount.id,
        paymentStatus: {
          name: mockedAccount.paymentStatus.name,
        },
        remaining: parseFloat(mockedAccount.remaining).toFixed(2),
        status: {
          name: mockedAccount.status.name,
        },
      })));
      await waitFor(() => expect(mockedHandleEdit).toHaveBeenCalledWith(1));
    });

    it('on submit should correctly change "CommentModal" open status', async () => {
      expect(CommentModal).toHaveBeenCalledWith(expect.objectContaining({ open: true }), {});

      fireEvent.click(screen.getByText(commentModalLabel));

      await waitFor(() => expect(mockedOnChangeActions).toHaveBeenCalledWith(({ comment: false })));
    });
  });
});

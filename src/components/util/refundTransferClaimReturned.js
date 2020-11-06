import {
  cloneDeep,
  orderBy
} from 'lodash';
import moment from 'moment';
import { refundClaimReturned } from '../../constants';


class RefundTransferCR {
refundTransfers = async (loan, props) => {
  const getAccounts = () => {
    const {
      mutator: {
        accounts: {
          GET,
        },
      }
    } = props;

    const lostStatus = refundClaimReturned.LOST_ITEM_FEE;
    const processingStatus = refundClaimReturned.LOST_ITEM_PROCESSING_FEE;

    const pathParts = [
      'accounts?query=',
      `loanId=="${loan.id}"`,
      ` and (feeFineType=="${lostStatus}"`,
      ` or feeFineType=="${processingStatus}")`
    ];
    const path = pathParts.reduce((acc, val) => acc + val, '');
    return GET({ path });
  };

  const setPaymentStatus = record => {
    const updatedRec = cloneDeep(record);
    updatedRec.paymentStatus.name = refundClaimReturned.PAYMENT_STATUS;
    return updatedRec;
  };

  const persistAccountRecord = record => {
    const {
      mutator: {
        activeAccount: {
          update,
        },
        accounts: {
          PUT,
        }
      }
    } = props;
    update({ id: record.id });
    return PUT(record);
  };

  const getAccountActions = account => {
    const {
      mutator: {
        feefineactions: {
          GET,
        }
      }
    } = props;
    const path = `feefineactions?query=(accountId==${account.id})&orderBy=dateAction&order=desc`;
    return GET({ path });
  };

  const filterTransferredActions = actions => actions
    .filter(
      record => record.typeAction && record.typeAction.startsWith(refundClaimReturned.TYPE_ACTION)
    );

  const persistRefundAction = action => {
    const {
      mutator: {
        feefineactions: {
          POST,
        },
      },
    } = props;
    return POST(action);
  };

  const createRefundActionTemplate = (account, transferredActions, type) => {
    const {
      okapi: {
        currentUser: {
          id: currentUserId,
          curServicePoint: {
            id: servicePointId
          }
        },
      },
    } = props;
    const orderedActions = orderBy(transferredActions, ['dateAction'], ['desc']);
    const now = moment().format();
    const amount = transferredActions.reduce((acc, record) => acc + record.amountAction, 0.0);
    const lastBalance = orderedActions[0].balance + amount;
    const balanceTotal = type.startsWith(refundClaimReturned.TRANSACTION_CREDITED)
      ? 0.0
      : lastBalance;
    const transactionVerb = type.startsWith(refundClaimReturned.TRANSACTION_CREDITED)
      ? refundClaimReturned.TRANSACTION_VERB_REFUND
      : refundClaimReturned.TRANSACTION_VERB_REFUNDED;

    const newAction = {
      dateAction: now,
      typeAction: type,
      comments: '',
      notify: false,
      amountAction: amount,
      balance: balanceTotal,
      transactionInformation: `${transactionVerb} to ${orderedActions[0].paymentMethod}`,
      source: orderedActions[0].source,
      paymentMethod: '',
      accountId: account.id,
      userId: currentUserId,
      createdAt: servicePointId,
    };
    return persistRefundAction(newAction);
  };

  const createRefunds = (account, actions) => {
    if (actions.length > 0) {
      createRefundActionTemplate(account, actions, refundClaimReturned.REFUNDED_ACTION).then(
        createRefundActionTemplate(account, actions, refundClaimReturned.CREDITED_ACTION)
      );
    }
  };

  const processAccounts = async () => {
    const accounts = await getAccounts();
    const updatedAccounts = await Promise.all(
      accounts
        .map(setPaymentStatus)
        .map(persistAccountRecord)
    );
    const accountsActions = await Promise.all(
      updatedAccounts
        .map(getAccountActions)
    );
    const transferredActions = accountsActions
      .map(filterTransferredActions);
    const accountsWithTransferredActions = accounts
      .map((account, index) => {
        return {
          account,
          actions: transferredActions[index]
        };
      });
    await Promise.all(accountsWithTransferredActions
      .map(({ account, actions }) => createRefunds(account, actions)));
  };

  await processAccounts();
};
}

const refundTransferClaimReturned = new RefundTransferCR();

export default refundTransferClaimReturned;

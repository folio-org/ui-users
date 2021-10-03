import {
  groupBy,
  orderBy,
  cloneDeep,
  flow,
  map,
} from 'lodash';
import moment from 'moment';
import { refundClaimReturned, itemStatuses, accountStatuses } from '../../constants';

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
    updatedRec.remaining = record.amount;
    updatedRec.status.name = accountStatuses.OPEN;
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
      record => record.typeAction && (record.typeAction.startsWith(refundClaimReturned.TRANSFERRED_ACTION) ||
         record.typeAction.startsWith(refundClaimReturned.PAID_ACTION))
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

  const createRefundActionTemplate = (transferredActions, type) => {
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
    const amount = transferredActions.reduce((acc, record) => acc + record.amountAction, 0.0);
    const lastBalance = orderedActions[0].balance + amount;
    const balanceTotal = type.startsWith(refundClaimReturned.TRANSACTION_CREDITED)
      ? 0.0
      : lastBalance;
    const now = type.startsWith(refundClaimReturned.TRANSACTION_CREDITED)
      ? moment().format()
      : moment().add(2, 'seconds').format();

    const transactionVerb = type.startsWith(refundClaimReturned.TRANSACTION_CREDITED)
      ? refundClaimReturned.TRANSACTION_VERB_REFUND
      : refundClaimReturned.TRANSACTION_VERB_REFUNDED;

    const [findPaid] = orderedActions.map(a => (!!a.typeAction.startsWith(refundClaimReturned.PAID_ACTION)));
    const informationPayment = (findPaid === true) ? 'Patron' : orderedActions[0].paymentMethod;
    const newAction = {
      dateAction: now,
      typeAction: type,
      comments: '',
      notify: false,
      amountAction: amount,
      balance: balanceTotal,
      transactionInformation: `${transactionVerb} to ${informationPayment}`,
      source: orderedActions[0].source,
      paymentMethod: '',
      accountId: orderedActions[0].accountId,
      userId: currentUserId,
      createdAt: servicePointId,
    };
    return persistRefundAction(newAction);
  };

  const createRefunds = async ({ actionsO }) => {
    if (actionsO.length > 0) {
      createRefundActionTemplate(actionsO, refundClaimReturned.CREDITED_ACTION).then(
        () => createRefundActionTemplate(actionsO, refundClaimReturned.REFUNDED_ACTION)
      );
    }
  };

  const getLoanStorage = () => {
    const {
      mutator: {
        loanstorage: {
          GET,
        }
      }
    } = props;
    const path = `loan-storage/loans/${loan.id}`;
    return GET({ path });
  };

  const updateLoanStorage = record => {
    const {
      mutator: {
        activeLoanStorage: {
          update,
        },
        loanstorage: {
          PUT,
        }
      }
    } = props;
    update({ id: record.id });
    return PUT(record);
  };

  const setAgedToLostBlank = record => {
    const updatedRec = cloneDeep(record);
    updatedRec.agedToLostDelayedBilling.lostItemHasBeenBilled = '';
    updatedRec.agedToLostDelayedBilling.dateLostItemShouldBeBilled = '';
    return updatedRec;
  };

  const updateAgedToLostLoan = async () => {
    const loanStorage = await getLoanStorage();
    const updateRecord = setAgedToLostBlank(loanStorage);
    updateLoanStorage(updateRecord);
  };

  const processAccounts = async () => {
    const validateItemStatus = loan.item.status.name;
    const isDeclaredLostItem = validateItemStatus === itemStatuses.DECLARED_LOST;
    const isAgedToLostItem = validateItemStatus === itemStatuses.AGED_TO_LOST;

    if (isAgedToLostItem) {
      updateAgedToLostLoan();
    }

    if (isAgedToLostItem || isDeclaredLostItem) {
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

      const AccountsByPayment = (ActionT) => flow(
        data => groupBy(data, 'paymentMethod'),
        data => map(data, ((actions, paymentMethodS) => {
          return {
            paymentMethod: paymentMethodS,
            actionsO: actions,
          };
        }))
      )(ActionT);

      const orderActions = transferredActions.map((actionT) => AccountsByPayment(actionT));

      await Promise.all(orderActions.map(a => a.map(({ actionsO }) => createRefunds({ actionsO }))));
    }
  };

  await processAccounts();
};
}

const refundTransferClaimReturned = new RefundTransferCR();

export default refundTransferClaimReturned;

import {
  accountRefundInfo,
  calculateSelectedAmount,
} from '../Accounts/accountFunctions';

const isRefundAllowed = (account, feeFineActions) => {
  const { hasBeenPaid, paidAmount, isCanceledAfterRefund } = accountRefundInfo(account, feeFineActions);
  const isAccountRefunded = calculateSelectedAmount([account], true, feeFineActions) <= 0;

  return !isAccountRefunded && !isCanceledAfterRefund && hasBeenPaid && paidAmount > 0;
};

export default isRefundAllowed;

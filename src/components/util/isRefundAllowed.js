import {
  accountRefundInfo,
  calculateSelectedAmount,
} from '../Accounts/accountFunctions';

const isRefundAllowed = (account, feeFineActions) => {
  const { hasBeenPaid, paidAmount, canceledAsError } = accountRefundInfo(account, feeFineActions);
  const isAccountRefunded = calculateSelectedAmount([account], true, feeFineActions) <= 0;

  return !isAccountRefunded && !canceledAsError && hasBeenPaid && paidAmount > 0;
};

export default isRefundAllowed;

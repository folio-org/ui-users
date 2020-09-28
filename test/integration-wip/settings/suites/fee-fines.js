import test from '../../../helpers/base-steps/simulate-server';

import {
  commentRequired,
  manualCharges,
  owner,
  paymentMethods,
  refundReasons,
  transferAccounts,
  waiveReasons
} from './fee-fine';

export default test('fee fines')
  .child('commentRequired', commentRequired)
  .child('manualCharges', manualCharges)
  .child('owner', owner)
  .child('paymentMethods', paymentMethods)
  .child('refundReasons', refundReasons)
  .child('transferAccounts', transferAccounts)
  .child('waiveReasons', waiveReasons);

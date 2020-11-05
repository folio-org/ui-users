export const requestStatuses = {
  AWAITING_PICKUP: 'Open - Awaiting pickup',
  AWAITING_DELIVERY: 'Open - Awaiting delivery',
  IN_TRANSIT: 'Open - In transit',
  NOT_YET_FILLED: 'Open - Not yet filled',
  PICKUP_EXPIRED: 'Closed - Pickup expired',
  CANCELLED: 'Closed - Cancelled',
  FILLED: 'Closed - Filled',
  UNFILLED: 'Closed - Unfilled',
};

export const itemStatuses = {
  CLAIMED_RETURNED: 'Claimed returned',
  DECLARED_LOST: 'Declared lost',
  AGED_TO_LOST: 'Aged to lost',
  LOST_AND_PAID: 'Lost and paid',
};

export const loanStatuses = {
  CLOSED: 'Closed',
};

export const loanActions = {
  CLAIMED_RETURNED: 'claimedReturned',
  DECLARED_LOST:'declaredLost',
  AGED_TO_LOST:'itemAgedToLost',
  CLOSED_LOAN:'closedLoan',
};

// The names of the mutators which can executed on a given loan.
// Currently used in:
// "withMarkAsMissing", "withClaimReturned" and "withDeclareLost"
export const loanActionMutators = {
  CLAIMED_RETURNED: 'claimReturned',
  DECLARE_LOST: 'declareLost',
  MARK_AS_MISSING: 'markAsMissing',
};

export const deliveryFulfillmentValues = {
  HOLD_SHELF: 'Hold Shelf',
  DELIVERY: 'Delivery',
};

export const sortTypes = {
  ASC: 'asc',
  DESC: 'desc',
};

export const statusFilter = [
  { label: 'ui-users.filters.status.active', value: 'active' },
  { label: 'ui-users.filters.status.inactive', value: 'inactive' }
];

/* With current id determines that this is fee/fine condition,
 because this conditions are validating with different message,
 and condition fields are rendering dinamically.
 All conditions (thare are 6 of them) are always present on BE
 with hardcoded ids for now. */
export const feeFineBalanceId = 'cf7a0d5f-a327-4ca1-aa9e-dc55ec006b8a';
export const MAX_RECORDS = '10000';

export const refundClaimReturned = {
  PAYMENT_STATUS: 'Suspended claim returned',
  LOST_ITEM_FEE: 'Lost item fee',
  LOST_ITEM_PROCESSING_FEE: 'Lost item processing fee',
  TYPE_ACTION: 'Transferred',
  CREDITED_ACTION: 'Credited fully-Claim returned',
  REFUNDED_ACTION: 'Refunded fully-Claim returned',
  TRANSACTION_CREDITED: 'Credited',
  TRANSACTION_VERB_REFUND: 'Refund',
  TRANSACTION_VERB_REFUNDED: 'Refunded',
};

export const paymentStatusesAllowedToRefund = [
  'Paid fully',
  'Paid partially',
  'Transferred fully',
  'Transferred partially',
];

export const waiveStatuses = [
  'Waived fully',
  'Waived partially'
];

export const refundStatuses = [
  'Refunded fully',
  'Refunded partially',
];

export const reportColumns = [
  'borrower.name',
  'borrower.barcode',
  'borrowerId',
  'dueDate',
  'loanDate',
  'loanPolicy.name',
  'loanPolicyId',
  'loanId',
  'feeFine',
  'item.title',
  'item.materialType.name',
  'item.status.name',
  'item.barcode',
  'item.callNumberComponents.prefix',
  'item.callNumberComponents.callNumber',
  'item.callNumberComponents.suffix',
  'item.volume',
  'item.enumeration',
  'item.chronology',
  'item.copyNumber',
  'item.contributors',
  'item.location.name',
  'item.instanceId',
  'item.holdingsRecordId',
  'itemId'
];

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
};

export const loanActions = {
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

export const paymentStatusesAllowedToRefund = [
  'Paid fully',
  'Paid partially',
  'Transferred fully',
  'Transferred partially',
];

/* With current id determines that this is fee/fine condition,
 because this condition is validating with different message,
 and condition fields are rendering dinamically.
 All conditions (thare are 6 of them) are always present on BE
 with hardcoded ids for now. */
export const feeFineBalanceId = 'cf7a0d5f-a327-4ca1-aa9e-dc55ec006b8a';

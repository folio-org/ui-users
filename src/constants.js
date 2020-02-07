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

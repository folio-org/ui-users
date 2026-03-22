const ITEM_STATUS_TRANSLATIONS = {
  'aged to lost': 'ui-users.item.status.agedToLost',
  'available': 'ui-users.item.status.available',
  'awaiting delivery': 'ui-users.item.status.awaitingDelivery',
  'awaiting pickup': 'ui-users.item.status.awaitingPickup',
  'checked out': 'ui-users.item.status.checkedOut',
  'claimed returned': 'ui-users.item.status.claimedReturned',
  'declared lost': 'ui-users.item.status.declaredLost',
  'lost and paid': 'ui-users.item.status.lostAndPaid',
  'long missing': 'ui-users.item.status.longMissing',
  'missing': 'ui-users.item.status.missing',
  'in process': 'ui-users.item.status.inProcess',
  'in process (non-requestable)': 'ui-users.item.status.inProcessNonRequestable',
  'in transit': 'ui-users.item.status.inTransit',
  'intellectual item': 'ui-users.item.status.intellectualItem',
  'on order': 'ui-users.item.status.onOrder',
  'order closed': 'ui-users.item.status.orderClosed',
  'paged': 'ui-users.item.status.paged',
  'restricted': 'ui-users.item.status.restricted',
  'unavailable': 'ui-users.item.status.unavailable',
  'unknown': 'ui-users.item.status.unknown',
  'withdrawn': 'ui-users.item.status.withdrawn',
};

const formatItemStatus = (formatMessage, statusName = '') => {
  if (!statusName) {
    return '';
  }

  const translation = ITEM_STATUS_TRANSLATIONS[statusName.trim().toLowerCase()];

  if (!translation) {
    return statusName;
  }

  return formatMessage({ id: translation });
};

export default formatItemStatus;

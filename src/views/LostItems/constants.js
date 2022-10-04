import {
  itemStatuses,
} from '../../constants';

export const PAGE_AMOUNT = 100;

export const ACTUAL_COST_RECORD_FIELD_NAME = {
  LOSS_TYPE: 'lossType',
  USER_ID: 'id',
  USER_BARCODE: 'barcode',
  USER_FIRST_NAME: 'firstName',
  USER_LAST_NAME: 'lastName',
  USER_MIDDLE_NAME: 'middleName',
  LOSS_DATE: 'lossDate',
  INSTANCE_TITLE: 'instanceTitle',
  PERMANENT_ITEM_LOCATION: 'permanentItemLocation',
  FEE_FINE_TYPE: 'feeFineType',
  FEE_FINE_OWNER: 'feeFineOwner',
  LOAN_ID: 'loanId',
  INSTANCE_ID: 'instanceId',
  ITEM_ID: 'itemId',
  HOLDINGS_RECORD_ID: 'holdingsRecordId',
};

export const ACTUAL_COST_RECORD_FIELD_PATH = {
  [ACTUAL_COST_RECORD_FIELD_NAME.LOSS_TYPE]: 'lossType',
  [ACTUAL_COST_RECORD_FIELD_NAME.USER_ID]: 'user.id',
  [ACTUAL_COST_RECORD_FIELD_NAME.USER_BARCODE]: 'user.barcode',
  [ACTUAL_COST_RECORD_FIELD_NAME.USER_FIRST_NAME]: 'user.firstName',
  [ACTUAL_COST_RECORD_FIELD_NAME.USER_LAST_NAME]: 'user.lastName',
  [ACTUAL_COST_RECORD_FIELD_NAME.USER_MIDDLE_NAME]: 'user.middleName',
  [ACTUAL_COST_RECORD_FIELD_NAME.LOSS_DATE]: 'lossDate',
  [ACTUAL_COST_RECORD_FIELD_NAME.INSTANCE_TITLE]: 'instance.title',
  [ACTUAL_COST_RECORD_FIELD_NAME.PERMANENT_ITEM_LOCATION]: 'item.permanentLocation',
  [ACTUAL_COST_RECORD_FIELD_NAME.FEE_FINE_TYPE]: 'feeFine.type',
  [ACTUAL_COST_RECORD_FIELD_NAME.FEE_FINE_OWNER]: 'feeFine.owner',
  [ACTUAL_COST_RECORD_FIELD_NAME.LOAN_ID]: 'loan.id',
  [ACTUAL_COST_RECORD_FIELD_NAME.INSTANCE_ID]: 'instance.id',
  [ACTUAL_COST_RECORD_FIELD_NAME.ITEM_ID]: 'item.id',
  [ACTUAL_COST_RECORD_FIELD_NAME.HOLDINGS_RECORD_ID]: 'item.holdingsRecordId',
};

export const SEARCH_FIELDS = [
  ACTUAL_COST_RECORD_FIELD_NAME.LOSS_TYPE,
];

export const ITEM_STATUSES_TRANSLATIONS_KEYS = {
  [itemStatuses.AGED_TO_LOST]: 'ui-users.lostItems.list.filters.lossType.agedToLost',
  [itemStatuses.DECLARED_LOST]: 'ui-users.lostItems.list.filters.lossType.declaredLost',
};

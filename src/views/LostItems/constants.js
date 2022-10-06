import {
  itemStatuses,
} from '../../constants';

export const PAGE_AMOUNT = 100;

export const ACTUAL_COST_RECORD_FIELD_NAME = {
  LOSS_TYPE: 'lossType',
  USER: 'user',
  USER_ID: 'id',
  USER_BARCODE: 'barcode',
  USER_FIRST_NAME: 'firstName',
  USER_LAST_NAME: 'lastName',
  USER_MIDDLE_NAME: 'middleName',
  USER_PATRON_GROUP: 'patronGroup',
  LOSS_DATE: 'lossDate',
  INSTANCE_TITLE: 'instanceTitle',
  MATERIAL_TYPE: 'materialType',
  PERMANENT_ITEM_LOCATION: 'permanentItemLocation',
  FEE_FINE_TYPE: 'feeFineType',
  FEE_FINE_OWNER: 'feeFineOwner',
  LOAN_ID: 'loanId',
  LOAN_TYPE: 'loanType',
  INSTANCE_ID: 'instanceId',
  INSTANCE_IDENTIFIERS: 'instanceIdentifiers',
  ITEM: 'item',
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
  [ACTUAL_COST_RECORD_FIELD_NAME.USER_PATRON_GROUP]: 'user.patronGroup',
  [ACTUAL_COST_RECORD_FIELD_NAME.LOSS_DATE]: 'lossDate',
  [ACTUAL_COST_RECORD_FIELD_NAME.INSTANCE_TITLE]: 'instance.title',
  [ACTUAL_COST_RECORD_FIELD_NAME.MATERIAL_TYPE]: 'item.materialType',
  [ACTUAL_COST_RECORD_FIELD_NAME.PERMANENT_ITEM_LOCATION]: 'item.permanentLocation',
  [ACTUAL_COST_RECORD_FIELD_NAME.FEE_FINE_TYPE]: 'feeFine.type',
  [ACTUAL_COST_RECORD_FIELD_NAME.FEE_FINE_OWNER]: 'feeFine.owner',
  [ACTUAL_COST_RECORD_FIELD_NAME.LOAN_ID]: 'loan.id',
  [ACTUAL_COST_RECORD_FIELD_NAME.LOAN_TYPE]: 'item.loanType',
  [ACTUAL_COST_RECORD_FIELD_NAME.INSTANCE_ID]: 'instance.id',
  [ACTUAL_COST_RECORD_FIELD_NAME.INSTANCE_IDENTIFIERS]: 'instance.identifiers',
  [ACTUAL_COST_RECORD_FIELD_NAME.ITEM_ID]: 'item.id',
  [ACTUAL_COST_RECORD_FIELD_NAME.ITEM]: 'item',
  [ACTUAL_COST_RECORD_FIELD_NAME.HOLDINGS_RECORD_ID]: 'item.holdingsRecordId',
};

export const SEARCH_FIELDS = [
  ACTUAL_COST_RECORD_FIELD_NAME.LOSS_TYPE,
];

export const ITEM_STATUSES_TRANSLATIONS_KEYS = {
  [itemStatuses.AGED_TO_LOST]: 'ui-users.lostItems.list.filters.lossType.agedToLost',
  [itemStatuses.DECLARED_LOST]: 'ui-users.lostItems.list.filters.lossType.declaredLost',
};

// When installing the BE module, the default data for "Resource identifier types" is set from the json and this "id" corresponds to the "ISBN"
// https://github.com/folio-org/mod-inventory-storage/blob/master/reference-data/identifier-types/isbn.json
export const ISBN_ID = '8261054f-be78-422d-bd51-4ed9f33c3422';

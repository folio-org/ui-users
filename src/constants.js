import { CUSTOM_FIELDS_SECTION_ID } from '@folio/stripes/smart-components';

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
  OPEN: 'Open',
};

export const accountStatuses = {
  CLOSED: 'Closed',
  OPEN: 'Open',
};

export const loanActions = {
  CLAIMED_RETURNED: 'claimedReturned',
  DECLARED_LOST: 'declaredLost',
  AGED_TO_LOST: 'itemAgedToLost',
  CLOSED_LOAN: 'closedLoan',
};

// The names of the mutators which can executed on a given loan.
// Currently used in:
// "withMarkAsMissing", "withClaimReturned", "withDeclareLost", "withAddInfo"
export const loanActionMutators = {
  CLAIMED_RETURNED: 'claimReturned',
  DECLARE_LOST: 'declareLost',
  MARK_AS_MISSING: 'markAsMissing',
  ADD_PATRON_INFO: 'patronInfo',
  ADD_STAFF_INFO: 'staffInfo',
};

export const CIRCULATION_BFF_LOANS_INTERFACE_NAME = 'circulation-bff-loans';
export const CIRCULATION_BFF_LOANS_INTERFACE_VERSION = '1.6';
export const CIRCULATION_BFF_LOANS_INTERFACE_ERROR = `Required okapi interfaces ${CIRCULATION_BFF_LOANS_INTERFACE_NAME} v${CIRCULATION_BFF_LOANS_INTERFACE_VERSION}`;

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
  LOST_ITEM_FEE_ACTUAL_COST: 'Lost item fee (actual cost)',
  LOST_ITEM_PROCESSING_FEE: 'Lost item processing fee',
  TRANSFERRED_ACTION: 'Transferred',
  PAID_ACTION: 'Paid',
  REFUNDED_TYPE_ACTION: 'Refund',
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

export const refundStatuses = {
  RefundedFully: 'Refunded fully',
  RefundedPartially: 'Refunded partially',
};

export const cancelledStatus = 'Cancelled as error';

export const outstandingStatus = 'Outstanding';

export const FEE_FINE_ACTIONS = {
  PAYMENT: 'payment',
  WAIVE: 'waive',
  TRANSFER: 'transfer',
  REFUND: 'refund',
};

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
  'feeFineExplanation',
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

export const refundReportColumns = [
  'patronName',
  'patronBarcode',
  'patronId',
  'patronGroup',
  'feeFineType',
  'feeFineOwner',
  'dateBilled',
  'billedAmount',
  'paidAmount',
  'paymentMethod',
  'transactionInfo',
  'transferredAmount',
  'transferAccount',
  'feeFineId',
  'refundDate',
  'refundAmount',
  'refundAction',
  'refundReason',
  'staffInfo',
  'patronInfo',
  'itemBarcode',
  'instance',
  'actionCompletionDate',
  'staffMemberName',
  'actionTaken'
];

export const feeFineReportColumns = [
  'patronName',
  'patronBarcode',
  'patronGroup',
  'actionDate',
  'actionDescription',
  'actionAmount',
  'actionBalance',
  'actionTransactionInfo',
  'actionCreatedAt',
  'actionSource',
  'actionInfoStaff',
  'actionInfoPatron',
  'type',
  'owner',
  'billedDate',
  'billedAmount',
  'remainingAmount',
  'latestPaymentStatus',
  'details',
  'itemInstance',
  'itemMaterialType',
  'itemBarcode',
  'itemCallNumber',
  'itemLocation',
  'itemDueDate',
  'itemReturnedDate',
  'itemOverduePolicy',
  'itemLostPolicy',
  'itemLoanDetails'
];

export const NO_FEE_FINE_OWNER_FOUND_MESSAGE = 'No fee/fine owner found for item\'s permanent location';

export const OVERRIDE_BLOCKS_FIELDS = {
  OVERRIDE_BLOCKS: 'overrideBlocks',
  COMMENT: 'comment',
  PATRON_BLOCK: 'patronBlock',
  RENEWAL_BLOCK: 'renewalBlock',
  RENEWAL_DUE_DATE_REQUIRED_BLOCK: 'renewalDueDateRequiredBlock',
  RENEWAL_DUE_DATE: 'dueDate',
};

export const DATE_FORMAT = 'YYYY-MM-DD';

export const cashMainReportColumns = [
  'source',
  'paymentMethod',
  'paymentAmount',
  'feeFineOwner',
  'feeFineType',
  'paymentDateTime',
  'paymentStatus',
  'transactionInfo',
  'additionalStaffInfo',
  'additionalPatronInfo'
];

export const cashMainReportColumnsCSV = [
  ...cashMainReportColumns,
  'feeFineDetails',
];

export const cashSourceReportColumns = [
  'source',
  'totalAmount',
  'totalCount'
];

export const cashSourceReportFooter = [
  'sourceTotal'
];

export const cashOwnerReportFooter = [
  'ownerTotal'
];

export const cashTypeReportFooter = [
  'typeTotal'
];

export const cashPaymentReportFooter = [
  'paymentTotal'
];

export const cashPaymentMethodReportColumns = [
  'paymentMethod',
  'totalAmount',
  'totalCount'
];

export const cashFeeFineTypeReportColumns = [
  'feeFineType',
  'totalAmount',
  'totalCount'
];

export const cashFeeFineOwnerReportColumns = [
  'feeFineOwner',
  'totalAmount',
  'totalCount'
];

export const financialTransactionsMainReportColumns = [
  'feeFineOwner',
  'feeFineType',
  'feeFineBilledAmount',
  'feeFineBilledDate',
  'feeFineCreated',
  'feeFineSource',
  'feeFineDetails',
  'action',
  'actionAmount',
  'actionDate',
  'actionCreated',
  'actionSource',
  'actionStatus',
  'actionStaffInfo',
  'actionPatronInfo',
  'paymentMethod',
  'paymentTransInfo',
  'waiveReason',
  'refundReason',
  'transferAccount',
  'patronName',
  'patronBarcode',
  'patronGroup',
  'patronEmail',
  'instance',
  'contributors',
  'itemBarcode',
  'callNumber',
  'effectiveLocation',
  'loanDate',
  'dueDate',
  'returnDate',
  'loanPolicy',
  'overduePolicy',
  'lostItemPolicy',
  'loanDetails'
];

export const SHARED_OWNER = 'Shared';

export const MIN_ALLOWED_DATE = '1900-01-01';

export const STATUS_CODES = {
  UNPROCESSABLE_ENTITY: 422,
};

export const SORT_DIRECTIONS = {
  asc: {
    name: 'asc',
    fullName: 'ascending',
  },
  desc: {
    name: 'desc',
    fullName: 'descending',
  },
};

export const OKAPI_TENANT_HEADER = 'X-Okapi-Tenant';
export const OKAPI_TOKEN_HEADER = 'X-Okapi-Token';

export const CONFIGURATIONS_API = 'configurations';
export const CONFIGURATIONS_ENTRIES_API = `${CONFIGURATIONS_API}/entries`;
export const CONSORTIA_API = 'consortia';
export const CONSORTIA_TENANTS_API = 'tenants';
export const CONSORTIA_USER_TENANTS_API = 'user-tenants';
export const GROUPS_API = 'groups';
export const PROFILE_PIC_API = 'users/profile-picture';
export const USERS_API = 'users';
export const PATRON_PREREGISTRATIONS_API = 'staging-users';
export const PERMISSIONS_API = 'perms/users';

export const RECORD_SOURCE = {
  CONSORTIUM: 'consortium',
};

export const DCB = 'dcb';

export const USER_TYPE_FIELD = 'type';
export const USER_TYPES = {
  PATRON: 'patron',
  SHADOW: 'shadow',
  STAFF: 'staff',
  SYSTEM: 'system',
  DCB: 'dcb',
};

export const DCB_INSTANCE_ID = '9d1b77e4-f02e-4b7f-b296-3f2042ddac54';
export const DCB_HOLDINGS_RECORD_ID = '10cd3a5a-d36f-4c7a-bc4f-e1ae3cf820c9';

export const DCB_VIRTUAL_USER = {
  personal: {
    lastName: 'DcbSystem',
  },
  type: DCB,
};

export const PROFILE_PIC_DEFAULT_MAX_SIZE_IN_MB = 10;
export const ACCEPTED_IMAGE_TYPES = 'image/jpg, image/jpeg, image/png';

export const READING_ROOM_ACCESS = {
  ALLOWED: 'Allowed',
  NOT_ALLOWED: 'Not allowed'
};

export const USER_INFO = {
  FIRST_NAME: 'personal.firstName',
  MIDDLE_NAME: 'personal.middleName',
  LAST_NAME: 'personal.lastName',
  MOBILE_PHONE: 'personal.mobilePhone',
  PHONE: 'personal.phone',
  PREFERRED_FIRST_NAME: 'personal.preferredFirstName',
  BARCODE: 'barcode',
  EXTERNAL_SYSTEM_ID: 'externalSystemId',
  USERNAME: 'username',
  PATRON_GROUP: 'patronGroup',
  EXPIRATION_DATE: 'expirationDate',
  PROFILE_PICTURE_LINK: 'personal.profilePictureLink'
};

export const USER_FIELDS_TO_CHECK = [USER_INFO.FIRST_NAME, USER_INFO.MIDDLE_NAME,
  USER_INFO.MOBILE_PHONE, USER_INFO.PHONE, USER_INFO.PREFERRED_FIRST_NAME,
  USER_INFO.BARCODE, USER_INFO.EXTERNAL_SYSTEM_ID, USER_INFO.USERNAME];

export const PATRON_PREREGISTRATION_RECORDS_NAME = 'patronPreRegistrationRecords';

export const KEYCLOAK_USER_EXISTANCE = {
  exist: 'exist',
  nonExist: 'nonExist',
  error: 'error',
};

export const NEW_FEE_FINE_FIELD_NAMES = {
  ITEM_BARCODE: 'itemBarcode',
  KEY_OF_ITEM_BARCODE: 'keyOfItemBarcode',
};

// These fields will be validated on the BE side
export const CUSTOM_FIELDS_SECTION = {
  CUSTOM_FIELDS: CUSTOM_FIELDS_SECTION_ID,
  USER_INFO: 'user_information',
  EXTENDED_INFO: 'extended_information',
  CONTACT_INFO: 'contact_information',
  FEES_FINES: 'fees_fines',
  LOANS: 'loans',
  REQUESTS: 'requests',
};

export const MODULE_NAME = 'users';
export const CUSTOM_FIELDS_ENTITY_TYPE = 'user';

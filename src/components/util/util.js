import React from 'react';
import { FormattedMessage } from 'react-intl';
import { every, orderBy } from 'lodash';
import queryString from 'query-string';

import { NoValue } from '@folio/stripes/components';

import {
  USER_TYPES,
  requestStatuses,
  sortTypes,
  DCB_INSTANCE_ID,
  DCB_HOLDINGS_RECORD_ID,
} from '../../constants';

/**
 * getFullName
 * return "last, first middle", derived from user.personal
 * preferred first name should be shown instead first name if present.
 *
 * @param {object} user
 * @returns string
 */
export function getFullName(user) {
  let fullName = user?.personal?.lastName || '';
  let givenName = user?.personal?.preferredFirstName || user?.personal?.firstName || '';
  const middleName = user?.personal?.middleName || '';
  if (middleName) {
    givenName += `${givenName ? ' ' : ''}${middleName}`;
  }

  if (givenName) {
    fullName += `${fullName ? ', ' : ''}${givenName}`;
  }

  return fullName;
}

export const formatActionDescription = (action) => {
  return action.typeAction +
    (action.paymentMethod
      ? ('-' + action.paymentMethod)
      : ' '
    );
};

export const formatCurrencyAmount = (amount = 0) => parseFloat(amount).toFixed(2);

export const formatDateAndTime = (date, formatter) => {
  return date ? formatter(date, { day: 'numeric', month: 'numeric', year: 'numeric' }) : '';
};


export const getServicePointOfCurrentAction = (action, servicePoints = []) => {
  const servicePoint = servicePoints.find(sp => sp.id === action.createdAt);
  const createAtValue = servicePoint ? servicePoint.name : action.createdAt;
  return createAtValue || <NoValue />;
};

export const calculateRemainingAmount = (remaining) => (parseFloat(remaining) * 100) / 100;

export function validate(item, index, items, field, label) {
  const error = {};
  for (let i = 0; i < items.length; i++) {
    const obj = items[i];
    if ((index !== i) && ((obj[field] || '').localeCompare(item[field], 'sv', { sensitivity: 'base' }) === 0)) {
      error[field] = (
        <FormattedMessage
          id="ui-users.duplicated"
          values={{ field: label }}
        />
      );
    }
  }
  return error;
}

export function getRecordObject(resources, ...args) {
  const res = {};
  args.forEach((resource) => {
    res[resource] = resources[resource].records;
  });
  return res;
}

export function retrieveNoteReferredEntityDataFromLocationState(state) {
  if (state) {
    return {
      name: state.entityName,
      type: state.entityType,
      id: state.entityId,
    };
  }

  return null;
}

export function getFilterStatusesString(statuses) {
  return statuses.map(status => `requestStatus.${status}`).join(',');
}

export function getClosedRequestStatusesFilterString() {
  const closedStatusesArr = [
    requestStatuses.PICKUP_EXPIRED,
    requestStatuses.CANCELLED,
    requestStatuses.FILLED,
    requestStatuses.UNFILLED,
  ];

  return getFilterStatusesString(closedStatusesArr);
}

export function getOpenRequestStatusesFilterString() {
  const openStatusesArr = [
    requestStatuses.AWAITING_PICKUP,
    requestStatuses.AWAITING_DELIVERY,
    requestStatuses.IN_TRANSIT,
    requestStatuses.NOT_YET_FILLED,
  ];

  return getFilterStatusesString(openStatusesArr);
}

export function getOpenRequestsPath(itemId) {
  const filterString = getOpenRequestStatusesFilterString();

  return `/requests?filters=${filterString}&query=${itemId}&sort=Request Date`;
}

export function getChargeFineToLoanPath(userId, loanId) {
  return `/users/${userId}/charge/${loanId}`;
}

export function calculateSortParams({
  sortOrder,
  sortValue,
  sortDirection,
  secondarySortOrderIndex = 0,
  secondarySortDirectionIndex = 0,
}) {
  const sortParams = {};

  if (sortOrder[0] !== sortValue) {
    sortParams.sortOrder = [sortValue, sortOrder[secondarySortOrderIndex]];
    sortParams.sortDirection = [sortTypes.ASC, sortDirection[secondarySortDirectionIndex]];
  } else {
    const direction = sortDirection[0] === sortTypes.DESC ? sortTypes.ASC : sortTypes.DESC;

    sortParams.sortDirection = [direction, sortDirection[1]];
  }

  return sortParams;
}

// Return true if every item in loans has the status itemStatus
export function hasEveryLoanItemStatus(loans, itemStatus) {
  return every(loans, (loan) => loan?.item?.status?.name === itemStatus);
}

// Return true if every item in loans has one of the statuses in the itemStatuses array
export function hasAnyLoanItemStatus(loans, itemStatuses) {
  return every(loans, (loan) => itemStatuses.includes(loan?.item?.status?.name));
}

export function accountsMatchStatus(accounts, status) {
  return every(accounts, (account) => account.status.name.toLowerCase() === status.toLowerCase());
}

export function getValue(value) {
  return value || '';
}

// Given a user record, test whether the user is active. Checking the `active` property ought to
// be sufficient, but test the expiration date as well just to be sure.
export function checkUserActive(user) {
  if (user.expirationDate == null || user.expirationDate === undefined) return user.active;
  return user.active && (new Date(user.expirationDate) >= new Date());
}

export const getContributors = (account, instance) => {
  const contributors = account?.contributors || instance?.contributors;

  return contributors?.map(({ name }) => name);
};

export const isConsortiumEnabled = stripes => {
  return stripes?.hasInterface('consortia');
};

export const getCentralTenantId = stripes => {
  return stripes?.user?.user?.consortium?.centralTenantId;
};

export const getRequestUrl = (barcode, userId) => {
  return barcode ?
    `/requests/?${queryString.stringify({
      layer: 'create',
      userBarcode: barcode,
    })}` :
    `/requests/?${queryString.stringify({
      layer: 'create',
      userId,
    })}`;
};

export const isPatronUser = (user) => user?.type === USER_TYPES.PATRON;
export const isDcbUser = (user) => user?.type === USER_TYPES.DCB;
export const isStaffUser = (user) => user?.type === USER_TYPES.STAFF;
export const isShadowUser = (user) => user?.type === USER_TYPES.SHADOW;

export const isAffiliationsEnabled = (user) => {
  return !isPatronUser(user) && !isDcbUser(user);
};

export const isDcbItem = (item) => item?.instanceId === DCB_INSTANCE_ID && item?.holdingsRecordId === DCB_HOLDINGS_RECORD_ID;

export const isAValidUUID = (str) => {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return regex.test(str);
};

export const isAValidURL = (str) => {
  return URL.canParse(str);
};

export const isAValidImageUrl = async (url) => {
  try {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  } catch (e) {
    return false;
  }
};

export const getReadingRoomSortedData = (e, meta, { data, order, direction }) => {
  let newSortDirection = sortTypes.ASC;
  if (order === meta.name) {
    newSortDirection = direction === sortTypes.ASC ? sortTypes.DESC : sortTypes.ASC;
  }
  const sortedData = orderBy(data,
    [sortedRecord => sortedRecord[meta.name]?.toLowerCase()], newSortDirection);

  return {
    data: sortedData,
    order: meta.name,
    direction: newSortDirection
  };
};

// Function to convert a Base64 string to a Blob
export const base64ToBlob = (base64, mimeType) => {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
};

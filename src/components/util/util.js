import _ from 'lodash';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import {
  requestStatuses,
  sortTypes,
} from '../../constants';

export function getFullName(user) {
  const lastName = _.get(user, 'personal.lastName', '');
  const firstName = _.get(user, 'personal.firstName', '');
  const middleName = _.get(user, 'personal.middleName', '');

  return `${lastName}${firstName ? ', ' : ' '}${firstName}${middleName ? ' ' : ''}${middleName}`;
}

export const formatActionDescription = (action) => {
  return action.typeAction +
    (action.paymentMethod
      ? ('-' + action.paymentMethod)
      : ' '
    );
};

export const formatCurrencyAmount = (amount = 0) => parseFloat(amount).toFixed(2);

export const formatDateAndTime = (date, formatter) => formatter(date, { day: 'numeric', month: 'numeric', year: 'numeric' });

export const getServicePointOfCurrentAction = (action, servicePoints = []) => {
  const servicePoint = servicePoints.find(sp => sp.id === action.createdAt);

  return servicePoint ? servicePoint.name : action.createdAt;
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
  return _.every(Object.values(loans), loan => loan?.item?.status?.name === itemStatus);
}

// Return true if every item in loans has one of the statuses in the itemStatuses array
export function hasAnyLoanItemStatus(loans, itemStatuses) {
  return _.every(Object.values(loans), loan => itemStatuses.includes(loan?.item?.status?.name));
}

export function accountsMatchStatus(accounts, status) {
  return accounts.every((account) => account.status.name.toLowerCase() === status.toLowerCase());
}

export function getValue(value) {
  return value || '';
}

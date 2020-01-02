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

export function eachPromise(arr, fn) {
  if (!Array.isArray(arr)) return Promise.reject(new Error('Array not found'));
  return arr.reduce((prev, cur) => (prev.then(() => fn(cur))), Promise.resolve());
}

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

export function getOpenRequestsPath(barcode) {
  const filterString = getOpenRequestStatusesFilterString();

  return `/requests?filters=${filterString}&query=${barcode}&sort=Request Date`;
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

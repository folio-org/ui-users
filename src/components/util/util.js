import _ from 'lodash';
import React from 'react';
import { FormattedMessage } from 'react-intl';

export function getFullName(user) {
  const lastName = _.get(user, ['personal', 'lastName'], '');
  const firstName = _.get(user, ['personal', 'firstName'], '');
  const middleName = _.get(user, ['personal', 'middleName'], '');

  return `${lastName}${firstName ? ', ' : ' '}${firstName} ${middleName}`;
}

export function getRowURL(user) {
  return `/users/view/${user.id}`;
}

export function isSubstringsInString(listSubStrings, testString) {
  return new RegExp(listSubStrings.join('|')).test(testString);
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

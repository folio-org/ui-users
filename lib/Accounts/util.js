import _ from 'lodash';
import React from 'react';
import { FormattedDate } from 'react-intl';

export function getFullName(user) {
  const lastName = _.get(user, ['personal', 'lastName'], '');
  const firstName = _.get(user, ['personal', 'firstName'], '');
  const middleName = _.get(user, ['personal', 'middleName'], '');

  return `${lastName}${firstName ? ', ' : ' '}${firstName} ${middleName}`;
}

export function formatDate(dateStr) {
  if (!dateStr) return dateStr;
  return (<FormattedDate value={dateStr} />);
}

export function getTotal(amount, taxvat) {
  if (!amount) return parseFloat(0).toFixed(2);
  // eslint-disable-next-line no-restricted-globals
  if (isNaN(amount)) return parseFloat(0).toFixed(2);
  // eslint-disable-next-line no-restricted-globals
  else if (isNaN(taxvat)) return parseFloat(amount).toFixed(2);
  else return parseFloat(parseFloat(amount) + ((amount * taxvat) / 100)).toFixed(2);
}

export function count(array) {
  const list = [];
  const countList = [];
  const result = [];
  array.forEach((a) => {
    const index = list.indexOf(a);
    if (index === -1) {
      list.push(a);
      countList.push(1);
    } else {
      countList[index]++;
    }
  });
  for (let i = 0; i < list.length; i++) {
    if (list[i] !== undefined) {
      result.push({ name: list[i], size: countList[i] });
    }
  }
  return result;
}

export function initialFilterState(config, filters) {
  const state = {};

  if (filters) {
    const fullNames = filters.split(',');
    for (let i = 0; i < fullNames.length; i++) {
      state[fullNames[i]] = true;
    }
  }

  return state;
}


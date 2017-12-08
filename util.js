import _ from 'lodash';
import React from 'react';
import { FormattedDate, FormattedTime } from 'react-intl';

export function formatDate(dateStr) {
  if (!dateStr) return dateStr;
  return (<FormattedDate value={dateStr} />);
}

export function formatDateTime(dateStr) {
  if (!dateStr) return dateStr;
  return (<span><FormattedDate value={dateStr} /> <FormattedTime value={dateStr} /></span>);
}

export function getFullName(user) {
  const lastName = _.get(user, ['personal', 'lastName'], '');
  const firstName = _.get(user, ['personal', 'firstName'], '');
  const middleName = _.get(user, ['personal', 'middleName'], '');

  return `${lastName}${firstName ? ', ' : ' '}${firstName} ${middleName}`;
}

export function getRowURL(user) {
  return `/users/view/${user.id}`;
}

export function getAnchoredRowFormatter(row) {
  return (
    <a
      href={getRowURL(row.rowData)} key={`row-${row.rowIndex}`}
      aria-label={row.labelStrings && row.labelStrings.join('...')}
      role="listitem"
      className={`${row.rowClass}`}
      {...row.rowProps}
    >
      {row.cells}
    </a>
  );
}

export function isSubstringsInString(listSubStrings, testString) {
  return new RegExp(listSubStrings.join('|')).test(testString);
}

export function eachPromise(arr, fn) {
  if (!Array.isArray(arr)) return Promise.reject(new Error('Array not found'));
  return arr.reduce((prev, cur) => (prev.then(() => fn(cur))), Promise.resolve());
}

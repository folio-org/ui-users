import _ from 'lodash';
import React from 'react';
import loanActionMap from './data/loanActionMap';

export function formatDate(dateStr, locale) {
  if (!dateStr) return dateStr;
  return new Date(Date.parse(dateStr)).toLocaleDateString(locale);
}

export function formatDateTime(dateStr, locale) {
  if (!dateStr) return dateStr;
  return new Date(Date.parse(dateStr))
    .toLocaleString(locale, { hour: '2-digit', minute:'2-digit' })
    .toLowerCase();
}

export function futureDate(dateStr, locale, days) {
  if (!dateStr) return dateStr;
  const date = new Date(Date.parse(dateStr));
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString(locale);
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
export function getItemStatusFormatter(loan) {
  return isSubstringsInString(['renewed', 'recalled', 'requested'], loan.action) ?
    `${_.get(loan, ['item', 'status', 'name'], '')} - ${loanActionMap[loan.action]}` :
    `${_.get(loan, ['item', 'status', 'name'], '')}`;
}

export function eachPromise(arr, fn) {
  if (!Array.isArray(arr)) return Promise.reject(new Error('Array not found'));
  return arr.reduce((prev, cur) => (prev.then(() => fn(cur))), Promise.resolve());
}

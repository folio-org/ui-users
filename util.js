import _ from 'lodash';
import React from 'react';

export function formatDate(dateStr, locale) {
  if (!dateStr) return dateStr;
  return new Date(Date.parse(dateStr)).toLocaleDateString(locale);
}

export function formatDateTime(dateStr, locale) {
  if (!dateStr) return dateStr;
  return new Date(Date.parse(dateStr)).toLocaleString(locale);
}

export function futureDate(dateStr, locale, days) {
  if (!dateStr) return dateStr;
  const date = new Date(Date.parse(dateStr));
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString(locale);
}

export function getFullName(user) {
  return `${_.get(user, ['personal', 'lastName'], '')},
    ${_.get(user, ['personal', 'firstName'], '')}
    ${_.get(user, ['personal', 'middleName'], '')}`;
}

export function getRowURL(user) {
  return `/users/view/${user.id}/${user.username}`;
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

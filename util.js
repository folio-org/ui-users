import _ from 'lodash';

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

import _ from 'lodash';
import React from 'react';
import { FormattedDate, FormattedTime } from 'react-intl';
import moment from 'moment'; // eslint-disable-line import/no-extraneous-dependencies

import { loanProfileTypesMap } from './constants';

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

export function isSubstringsInString(listSubStrings, testString) {
  return new RegExp(listSubStrings.join('|')).test(testString);
}

export function eachPromise(arr, fn) {
  if (!Array.isArray(arr)) return Promise.reject(new Error('Array not found'));
  return arr.reduce((prev, cur) => (prev.then(() => fn(cur))), Promise.resolve());
}

export function getFixedDueDateSchedule(schedules) {
  const today = moment(new Date());
  return schedules.find(s =>
    today.isBetween(moment(s.from).startOf('day'), moment(s.to).endOf('day')));
}

export function isRollingProfileType(loanProfile) {
  return (loanProfile.profileId === loanProfileTypesMap.ROLLING ||
    loanProfile.profileId === 'ROLLING');
}

export function calculateDueDate(loan) {
  const loanPolicy = loan.loanPolicy;
  const loanProfile = loanPolicy.loansPolicy || {};

  // rolling type
  if (isRollingProfileType(loanProfile) && loanPolicy.loanable) {
    if (loanPolicy.fixedDueDateSchedule) {
      return loanPolicy.fixedDueDateSchedule.schedule.due;
    }
  }

  return moment(loan.dueDate).add(30, 'days').format();
}

import _ from 'lodash';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import packageInfo from '../package';

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

// TODO:
// If no history (direct link) cancel/back buttons should know where to go.
// this can be set up in the container and relayed through props.

// when a route is visited from outside of the module, the back/cancel should function as a
// a browser's back button, actually going back in history.

// when a workflow is visited from outside of the module, the back/cancel button should send them
// back to where they were. This can be handled through Link's 'to: { state: { referrer }}'

// Approach: 
// Routes set up a default referrer if no referrer/"home" is supplied.

export function handleBackLink(
  location,
  history,
  goHome = () => { history.replace(packageInfo.stripes.home); }
) {
  if (!location.state) { // regular back button
    history.goBack();
  // page is reachable from outside the module...
  // this will execute if the 'referrer' field is set on the 'state'
  // this happens in stripes-core main navigation buttons.
  } else if (location.state && location.state.referrer === 'home') {
    goHome();
    // for non-linear paths wi
  } else if (location.state && location.state.referrer) {
    history.push(location.state.referrer);
  }
}

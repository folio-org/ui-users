import React from 'react';
import moment from 'moment';
import { FormattedMessage } from 'react-intl';
import { get } from 'lodash';

/**
 * getProxySponsorWarning
 * Return a warning for the given namespace-index pair if any one of these
 * conditions is true:
 *
 * 1. the current user is expired
 * 2. the proxy or sponsor is expired
 * 3. the proxy relationship itself is expired
 *
 * Return an empty string otherwise.
 *
 * Sometimes, a date is just a date and you don't care about the time. If
 * Harry Potter were born at 12:30 a.m. on July 31 in London, there wouldn't
 * be anybody in Boston claiming his birthday was July 30 because it's only
 * 8:30 p.m. in Boston. July 31 is July 31, end of story. Thus, the `day`
 * modifier to all the date comparisons here; we DO NOT CARE about the time.
 *
 * @param object values all form values
 * @param enum namespace one of `proxies` or `sponsors`
 * @param int index index into the array
 *
 * @return empty string indicates no warnings; a string contains a warning message.
 */
export default function getProxySponsorWarning(values, namespace, index) {
  const proxyRel = values[namespace][index] || {};
  const today = moment().endOf('day');
  let warning = '';

  // proxy/sponsor user expired
  if (get(proxyRel, 'user.expirationDate') && moment(proxyRel.user.expirationDate).isSameOrBefore(today, 'day')) {
    warning = <FormattedMessage id={`ui-users.errors.${namespace}.expired`} />;
  }

  // current user expired
  if (values.expirationDate && moment(values.expirationDate).isSameOrBefore(today, 'day')) {
    warning = <FormattedMessage id="ui-users.errors.currentUser.expired" />;
  }

  // proxy relationship expired
  if (get(proxyRel, 'proxy.expirationDate') &&
    moment(proxyRel.proxy.expirationDate).isSameOrBefore(today, 'day')) {
    warning = <FormattedMessage id="ui-users.errors.proxyrelationship.expired" />;
  }

  return warning;
}

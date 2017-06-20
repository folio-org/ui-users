import _ from 'lodash';
import { countriesByCode } from './data/countries';

export function formatDate(dateStr, locale) {
  if (!dateStr) return dateStr;
  return new Date(Date.parse(dateStr)).toLocaleDateString(locale);
}

export function getFullName(user) {
  return `${_.get(user, ['personal', 'lastName'], '')},
    ${_.get(user, ['personal', 'firstName'], '')}
    ${_.get(user, ['personal', 'middleName'], '')}`;
}

export function getAddresses(user) {
  const addresses = _.get(user, ['personal', 'addresses'], []);

  if (!addresses.length) return addresses;

  return addresses.map(addr =>
    Object.assign(addr, {
      id: addr.id || _.uniqueId(),
      country: countriesByCode[addr.countryId].country,
    }),
  );
}

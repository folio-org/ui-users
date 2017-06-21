import _ from 'lodash';
import { countriesByCode, countriesByName } from './data/countries';
import { addressTypesById, addressTypesByDesc } from './data/addressTypes';

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
      addressType: addressTypesById[addr.addressTypeId].desc,
    }),
  );
}

export function updateAddresses(user, addr) {
  const addresses = _.get(user, ['personal', 'addresses'], []);
  const addressTypeId = addressTypesByDesc[addr.addressType].id;
  const countryId = countriesByName[addr.country].alpha2;
  const id = addr.id || _.uniqueId();
  let index = 0;

  Object.assign(addr, { id, addressTypeId, countryId });

  if (addresses.length) {
    index = _.findIndex(addresses, a => a.id === addr.id);
    if (index === -1) index = addresses.length;
  }

  addresses[index] = addr;
  return addresses;
}

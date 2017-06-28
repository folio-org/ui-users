import _ from 'lodash';
import { countriesByCode, countriesByName } from '../data/countries';
import { addressTypesByDesc, addressTypesById } from '../data/addressTypes';

function toListAddress(addr) {
  const country = (addr.countryId) ? countriesByCode[addr.countryId].country : '';
  const addressType = (addr.addressTypeId) ? addressTypesById[addr.addressTypeId].desc : '';

  return Object.assign(addr, {
    id: addr.id || _.uniqueId(),
    stateRegion: addr.region,
    primary: addr.primaryAddress,
    zipCode: addr.postalCode,
    country,
    addressType,
  });
}

function toUserAddress(addr) {
  const addressTypeId = (addr.addressType) ? addressTypesByDesc[addr.addressType].id : '';
  const countryId = (addr.country) ? countriesByName[addr.country].alpha2 : '';

  return {
    addressLine1: addr.addressLine1,
    addressLine2: addr.addressLine2,
    city: addr.city,
    region: addr.stateRegion,
    postalCode: addr.zipCode,
    primaryAddress: addr.primary,
    addressTypeId,
    countryId,
  };
}

export function toListAddresses(addresses) {
  if (!addresses || !addresses.length) return addresses;
  return Array.from(addresses).map(toListAddress);
}

export function toUserAddresses(addresses) {
  return addresses.map(toUserAddress);
}

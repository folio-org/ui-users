import _ from 'lodash';
import { countriesByCode, countriesByName } from '../../data/countries';
import { addressTypesByDesc, addressTypesById } from '../../data/addressTypes';

function toListAddress(addr) {
  return Object.assign(addr, {
    id: addr.id || _.uniqueId(),
    country: countriesByCode[addr.countryId].country,
    addressType: addressTypesById[addr.addressTypeId].desc,
    stateRegion: addr.region,
    primary: addr.primaryAddress,
    zipCode: addr.postalCode,
  });
}

function toUserAddress(addr) {
  return {
    addressLine1: addr.addressLine1,
    addressLine2: addr.addressLine2,
    city: addr.city,
    addressTypeId: addressTypesByDesc[addr.addressType].id,
    countryId: countriesByName[addr.country].alpha2,
    region: addr.stateRegion,
    postalCode: addr.zipCode,
    primaryAddress: addr.primary,
  };
}

export function toListAddresses(addresses) {
  if (!addresses || !addresses.length) return addresses;
  return Array.from(addresses).map(toListAddress);
}

export function toUserAddresses(addresses) {
  return addresses.map(toUserAddress);
}

import _ from 'lodash';
import { countriesByCode, countriesByName } from '../data/countries';
import { addressTypesByDesc, addressTypesById } from '../data/addressTypes';
import { hashCode } from 'hashcode';

function toListAddress(addr) {
  if (addr.id) return { ...addr };
  const country = (addr.countryId) ? countriesByCode[addr.countryId].country : '';
  const addressType = ''; // TODO fix when UIU-79 and UIU-80 are in place
  const id = hashCode().value(addr).toString(); // TODO: remove when id comes from the server

  return {
    id,
    addressLine1: addr.addressLine1,
    addressLine2: addr.addressLine2,
    city: addr.city,
    primaryAddress: addr.primaryAddress,
    primary: addr.primaryAddress,
    stateRegion: addr.region,
    zipCode: addr.postalCode,
    country,
    addressType,
    addressTypeId: addr.addressTypeId, // TODO: remove after UIU-79 and UIU-80 are in place
  };
}

function toUserAddress(addr) {
  const countryId = (addr.country) ? countriesByName[addr.country].alpha2 : '';

  return {
    addressLine1: addr.addressLine1,
    addressLine2: addr.addressLine2,
    city: addr.city,
    primaryAddress: addr.primaryAddress,
    region: addr.stateRegion,
    postalCode: addr.zipCode,
    addressTypeId: addr.addressTypeId, // TODO: lookup by addressType when UIU-79 and UIU-80 are in place
    countryId,
  };
}

export function toListAddresses(addresses) {
  if (!addresses || !addresses.length) return addresses;
  return addresses.map(toListAddress);
}

export function toUserAddresses(addresses) {
  if (!addresses || !addresses.length) return addresses;
  return addresses.map(toUserAddress);
}

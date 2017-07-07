import _ from 'lodash';
import { countriesByCode, countriesByName } from '../data/countries';
import { addressTypesByDesc, addressTypesById } from '../data/addressTypes';
import { hashCode } from 'hashcode';

function toListAddress(addr) {
  if (addr.id) return { ...addr };
  const country = (addr.countryId) ? countriesByCode[addr.countryId].country : '';
  //const addressType = (addr.addressTypeId) ? addressTypesById[addr.addressTypeId].desc : '';
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
  };
}

function toUserAddress(addr) {
  //const addressTypeId = (addr.addressType) ? addressTypesByDesc[addr.addressType].id : '';
  const addressTypeId = ''; // TODO: fix when UIU-79 and UIU-80 are in place
  const countryId = (addr.country) ? countriesByName[addr.country].alpha2 : '';

  return {
    addressLine1: addr.addressLine1,
    addressLine2: addr.addressLine2,
    city: addr.city,
    primaryAddress: addr.primaryAddress,
    region: addr.stateRegion,
    postalCode: addr.zipCode,
    addressTypeId,
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

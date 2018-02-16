import _ from 'lodash';
import { hashCode } from 'hashcode';
import { countriesByCode, countriesByName } from '../data/countries';
import { getAddressTypesByName, getAddressTypesById } from './address_type';

function toListAddress(addr, addrType) {
  if (addr.id) return { ...addr };

  const country = (addr.countryId) ? countriesByCode[addr.countryId].country : '';
  const addressType = _.get(addrType, ['addressType'], '');
  const id = hashCode().value(addr).toString();

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

function toUserAddress(addr, addrType) {
  // console.log('toUserAddress for', addr, '-- countriesByName[addr.country] =', countriesByName[addr.country]);
  const countryId = (addr.country) ? countriesByName[addr.country].alpha2 : '';
  const addressTypeId = _.get(addrType, ['id'], '');
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

export function toListAddresses(addresses, addressTypes) {
  if (!addresses || !addresses.length) return addresses;

  const addressTypesById = getAddressTypesById(addressTypes);
  return _.sortBy(addresses, a => -a.primaryAddress).map(addr =>
    toListAddress(addr, addressTypesById[addr.addressTypeId]));
}

export function toUserAddresses(addresses, addressTypes) {
  if (!addresses || !addresses.length) return addresses;

  const addressTypesByName = getAddressTypesByName(addressTypes);
  return addresses.map(addr =>
    toUserAddress(addr, addressTypesByName[addr.addressType]));
}

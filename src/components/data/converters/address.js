import _ from 'lodash';
import { hashCode } from 'hashcode';

function toListAddress(addr) {
  const country = (addr.countryId) ? addr.countryId : '';
  const addressId = addr.id || hashCode().value(addr).toString();

  return {
    id: addressId,
    addressLine1: addr.addressLine1,
    addressLine2: addr.addressLine2,
    city: addr.city,
    stateRegion: addr.region,
    zipCode: addr.postalCode,
    country,
    addressType: addr.addressTypeId,
    primaryAddress: addr.primaryAddress,
    primary: addr.primaryAddress,
  };
}

export function getFormAddressList(addresses) {
  if (!addresses || !addresses.length) return addresses;

  return _.sortBy(addresses, a => -a.primaryAddress)
    .map(addr => toListAddress(addr));
}

export function toUserAddresses(addresses) {
  if (_.isEmpty(addresses)) return;

  // eslint-disable-next-line consistent-return
  return addresses.map(address => {
    return {
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      city: address.city,
      primaryAddress: address.primaryAddress,
      region: address.stateRegion,
      postalCode: address.zipCode,
      addressTypeId: address.addressType,
      countryId: address.country,
    };
  });
}

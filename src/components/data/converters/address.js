import _ from 'lodash';
import { hashCode } from 'hashcode';

function toListAddress(addr) {
  if (addr.id) return { ...addr };

  const country = (addr.countryId) ? addr.countryId : '';
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
    addressType: addr.addressTypeId,
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

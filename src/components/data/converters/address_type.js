export function toAddressTypeOptions(addressTypes) {
  if (!addressTypes) return [];
  return addressTypes.map(at => ({
    label: at.addressType,
    value: at.addressType,
  }));
}

export function getAddressTypesById(addressTypes) {
  if (!addressTypes) return {};
  return addressTypes.reduce((map, addrType) => (Object.assign(map, { [addrType.id]: addrType })), {});
}

export function getAddressTypesByName(addressTypes) {
  if (!addressTypes) return {};
  return addressTypes.reduce((map, addrType) => (Object.assign(map, { [addrType.addressType]: addrType })), {});
}

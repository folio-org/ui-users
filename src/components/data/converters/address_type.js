// eslint-disable-next-line import/prefer-default-export
export function toAddressTypeOptions(addressTypes) {
  if (!addressTypes) return [];
  return addressTypes.map(at => ({
    label: at.addressType,
    value: at.id,
  }));
}

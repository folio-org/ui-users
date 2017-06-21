const addressTypes = [
  { "id": "001", "desc": "Claim" },
  { "id": "002", "desc": "Home" },
  { "id": "003", "desc": "Order" },
  { "id": "004", "desc": "Payment" },
  { "id": "005", "desc": "Returns" },
  { "id": "006", "desc": "Work" },
];

export const addressTypesById = addressTypes.reduce((map, addrType) =>
  (Object.assign(map, { [addrType.id]: addrType })), {});

export const addressTypesByDesc = addressTypes.reduce((map, addrType) =>
  (Object.assign(map, { [addrType.desc]: addrType })), {});

export const addressTypeOptions = addressTypes.map(addrType => ({
  label: addrType.desc,
  value: addrType.desc,
}));

export default addressTypes;

import { Factory, faker } from '@bigtest/mirage';

export default Factory.extend({
  countryId: () => faker.address.countryCode(),
  addressLine1: () => faker.address.streetAddress(),
  city: () => faker.address.city(),
  region: () => faker.address.state(),
  postalCode: () => faker.address.zipCode(),
  addressTypeId: () => faker.random.arrayElement([
    'Type1',
    'Type2',
    'Type3',
    'Type4',
    'Type5',
    'Type6'
  ]),
  primaryAddress: () => true,
});

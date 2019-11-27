import { Factory, faker } from '@bigtest/mirage';

export default Factory.extend({
  countryId: () => faker.address.countryCode(),
  addressLine1: () => faker.address.streetAddress(),
  city: () => faker.address.city(),
  region: () => faker.address.state(),
  postalCode: () => faker.address.zipCode(),
  addressType: () => 'Type1',
  primaryAddress: () => true,
});

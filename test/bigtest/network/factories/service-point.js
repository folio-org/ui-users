import { Factory } from 'miragejs';
import faker from 'faker';

export default Factory.extend({
  id: () => faker.random.uuid(),
  name: () => faker.random.word(),
  code: () => faker.random.word(),
  discoveryDisplayName: () => faker.random.words(),
  description: () => faker.random.words(),
  shelvingLagTime: () => faker.random.number(),
  pickupLocation: () => faker.random.boolean(),
  holdShelfExpiryPeriod: () => {}
});

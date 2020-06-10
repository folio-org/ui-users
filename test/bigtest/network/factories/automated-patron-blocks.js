import { Factory } from 'miragejs';
import faker from 'faker';

export default Factory.extend({
  patronBlockConditionId: () => faker.random.uuid(),
  blockBorrowing: () => faker.random.boolean(),
  blockRenewals: () => faker.random.boolean(),
  blockRequests: () => faker.random.boolean(),
  message: () => faker.random.message(),
});

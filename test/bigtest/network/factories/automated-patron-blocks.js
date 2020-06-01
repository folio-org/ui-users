import { Factory } from 'miragejs';
import faker from 'faker';

export default Factory.extend({
  patronBlockConditionId: () => faker.random.uuid(),
  blockBorrowing: () => faker.random.boolean(),
  blockRenewal: () => faker.random.boolean(),
  blockRequest: () => faker.random.boolean(),
  message: () => faker.random.message(),
});

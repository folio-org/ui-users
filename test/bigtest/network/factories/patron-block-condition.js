import { Factory } from 'miragejs';
import faker from 'faker';

export default Factory.extend({
  id: () => faker.random.uuid(),
  name: () => faker.lorem.sentence(),
  blockBorrowing: () => faker.random.boolean(),
  blockRenewals: () => faker.random.boolean(),
  blockRequests: () => faker.random.boolean(),
  valueType: 'Integer',
  message: () => faker.lorem.sentence(),
  metadata : {
    createdDate : () => faker.date.past(0.1, faker.date.past(0.1)).toString(),
    updatedDate : () => faker.date.past(0.1, faker.date.past(0.1)).toString(),
  }
});

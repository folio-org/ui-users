import { Factory } from 'miragejs';
import faker from 'faker';

export default Factory.extend({
  id: () => faker.random.uuid(),
  patronGroupId: () => faker.random.uuid(),
  conditionId: () => faker.random.uuid(),
  value: () => faker.random.number(),
  metadata : {
    createdDate : () => faker.date.past(0.1, faker.date.past(0.1)).toString(),
    updatedDate : () => faker.date.past(0.1, faker.date.past(0.1)).toString(),
    createdByUserId: () => faker.random.uuid(),
    updatedByUserId: () => faker.random.uuid(),
  }
});

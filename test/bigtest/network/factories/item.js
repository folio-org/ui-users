import { Factory } from 'miragejs';
import faker from 'faker';

export default Factory.extend({
  barcode: () => faker.random.number(),
  id: () => faker.random.uuid(),
  title:() => faker.random.words(),
  metadata: {
    createdDate: () => faker.date.past(0.1, faker.date.past(0.1)).toString(),
    updatedDate: () => faker.date.past(0.1).toString(),
  },
});

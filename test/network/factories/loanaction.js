import { Factory, association } from 'miragejs';
import faker from 'faker';

export default Factory.extend({
  id: () => faker.random.uuid(),
  operation: 'I',
  createdDate: () => faker.date.future(0.1).toString(),
  loan: association()
});

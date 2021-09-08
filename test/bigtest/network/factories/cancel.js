import { Factory } from 'miragejs';
import faker from 'faker';

export default Factory.extend({
  comments: () => `STAFF : ${faker.company.catchPhrase()} \n PATRON : ${faker.company.catchPhrase()}`,
  notifyPatron: () => faker.random.boolean(),
  servicePointId: () => faker.random.uuid(),
  userName: () => `${faker.name.lastName()}, ${faker.name.firstName()}`
});

import { Factory } from 'miragejs';
import faker from 'faker';

export default Factory.extend({
  id: () => faker.random.uuid(),
  userId: () => faker.random.uuid(),
  username: () => faker.internet.userName(),
  password: () => faker.internet.password(),
  salt: () => faker.random.uuid(),
});

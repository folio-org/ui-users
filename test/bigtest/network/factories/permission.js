import { Factory } from 'miragejs';
import faker from 'faker';

export default Factory.extend({
  id: () => faker.random.uuid(),
  description: () => faker.company.catchPhrase(),
  displayName: () => faker.company.catchPhrase(),
  permissionName: () => faker.company.catchPhrase(),
  dummy: false,
  mutable: false,
  visible: true,
});

import { Factory, faker } from '@bigtest/mirage';

export default Factory.extend({
  id: () => faker.random.uuid(),
  owner: () => faker.random.word(),
  desc: () => faker.random.word(),
  servicePointOwner: [],
});

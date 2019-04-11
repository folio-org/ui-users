import { Factory, faker } from '@bigtest/mirage';

export default Factory.extend({
  id: () => faker.random.uuid(),
  ownerId: () => faker.random.uuid(),
  feeFineType: () => faker.random.word(),
  defaultAmount: 200.0,
  servicePointOwner: [],
});

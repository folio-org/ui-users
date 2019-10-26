import {
  Factory,
  faker,
} from '@bigtest/mirage';

export default Factory.extend({
  id: () => faker.random.uuid(),
  userId: () => faker.random.uuid(),
  proxyUserId: () => faker.random.uuid(),
  createdDate: () => faker.date.past(0.1).toString(), // deprecated
  requestForSponsor: faker.random.arrayElement(['yes', 'no']),
  notificationsTo: () => faker.random.uuid(),
  accrueTo: () => faker.random.uuid(),
  status: () => faker.random.arrayElement(['Active', 'Inactive']),
  expirationDate: () => faker.date.future(0.1).toString(),
  metadata: {
    createdDate: () => faker.date.past(0.1, faker.date.past(0.1)).toString(),
    createdByUserId: () => faker.random.uuid(),
    updatedDate: () => faker.date.past(0.1).toString(),
    updatedByUserId: () => faker.random.uuid(),
  }
});

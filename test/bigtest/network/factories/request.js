import { Factory, faker } from '@bigtest/mirage';

export default Factory.extend({
  id: () => faker.random.uuid(),
  requestType: () => faker.random.arrayElement(['Hold', 'Recall']),
  requestDate: () => faker.date.past(0.1, faker.date.past(0.1)).toString(),
  requesterId: () => faker.random.uuid(),
  itemId: () => faker.random.uuid(),
  item: {
    title: () => faker.company.catchPhrase(),
    barcode: () => faker.random.number(),
  },
  requester: {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    middleName: faker.internet.userName(),
    barcode: faker.random.number(),
  },
  requestExpirationDate: faker.date.future(0.1).toString(),
  metadata: {
    createdDate: faker.date.past(0.1, faker.date.past(0.1)).toString(),
    createdByUserId: faker.random.uuid(),
    updatedDate: faker.date.past(0.1).toString(),
    updatedByUserId: faker.random.uuid(),
  }
});

import { Factory, faker } from '@bigtest/mirage';

export default Factory.extend({
  id: () => faker.random.uuid(),
  operation: 'I',
  createdDate: () => faker.date.future(0.1).toString(),
  loan: {
    id: () => faker.random.uuid(),
    dueDate: () => faker.date.future(0.1).toString(),
    action: () => faker.random.arrayElement(['checkedout', 'checkedin', 'renewed']),
    itemStatus: () => faker.lorem.word(),
    metadata: {
      createdDate: faker.date.past(0.1, faker.date.past(0.1)).toString(),
      createdByUserId: faker.random.uuid(),
      updatedDate: faker.date.past(0.1).toString(),
      updatedByUserId: faker.random.uuid(),
    }
  },
});

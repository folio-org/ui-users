import { Factory, faker } from '@bigtest/mirage';

export default Factory.extend({
  id: () => faker.random.uuid(),
  userId: () => faker.random.uuid(),
  itemId: () => faker.random.uuid(),
  status: {
    name: () => faker.random.arrayElement(['Open', 'Closed']),
  },
  loanDate: () => faker.date.past(0.1, faker.date.past(0.1)).toString(),
  dueDate: () => faker.date.future(0.1, faker.date.future(0.1)).toString(),
  returnDate: () => faker.date.future(0.1).toString(),
  systemReturnDate: () => faker.date.future(0.1).toString(),
  action: () => faker.company.catchPhrase(),
  actionComment: () => faker.company.catchPhrase(),
  itemStatus: () => faker.company.catchPhrase(),
  renewalCount: () => faker.random.number(),
  loanPolicyId: () => faker.random.uuid(),

  item: {
    id: () => faker.random.uuid(),
    holdingsRecordId: () => faker.random.uuid(),
    instanceId: () => faker.random.uuid(),
    title: () => faker.company.catchPhrase(),
    barcode: () => faker.random.number(),

  },
  metadata: {
    createdDate: faker.date.past(0.1, faker.date.past(0.1)).toString(),
    createdByUserId: faker.random.uuid(),
    updatedDate: faker.date.past(0.1).toString(),
    updatedByUserId: faker.random.uuid(),
  }
});

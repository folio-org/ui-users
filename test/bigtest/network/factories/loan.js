import { Factory, faker, trait } from '@bigtest/mirage';

export default Factory.extend({
  id: () => faker.random.uuid(),
  itemId: () => faker.random.uuid(),
  status: {
    name: () => faker.random.arrayElement(['Open', 'Closed']),
  },
  loanDate: () => faker.date.past(0.1, faker.date.past(0.1)).toString(),
  dueDate: () => faker.date.future(0.1, faker.date.future(0.1)).toString(),
  returnDate: () => faker.date.future(0.1).toString(),
  systemReturnDate: () => faker.date.future(0.1).toString(),
  action: () => () => faker.random.arrayElement(['checkedout', 'checkedin', 'renewed', 'holdrequested']),
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

  feesAndFines: trait({
    amountRemainingToPay: faker.finance.amount()
  }),

  metadata: {
    createdDate: () => faker.date.past(0.1, faker.date.past(0.1)).toString(),
    createdByUserId: () => faker.random.uuid(),
    updatedDate: () => faker.date.past(0.1).toString(),
    // updatedByUserId: faker.random.uuid(),
  },

  borrower: trait({
    borrower: {
      firstName : () => faker.name.firstName(),
      lastName : () => faker.name.lastName(),
      middleName : () => faker.name.middleName,
      barcode : 109322966913845
    }
  }),

  afterCreate(loan, server) {
    if (!loan.attrs.userId) {
      const user = server.create('user');
      loan.update({ userId: user.id });
    }

    if (!loan.attrs.metadata || !loan.attrs.metadata.updatedByUserId) {
      const creatingUser = server.create('user');
      const updatingUser = server.create('user');

      loan.update(
        { metadata: {
          ...loan.attrs.metadata,
          createdByUserId: creatingUser.id,
          updatedByUserId: updatingUser.id
        } }
      );
    }
  }
});

import { Factory } from 'miragejs';
import faker from 'faker';

export default Factory.extend({
  id: () => faker.random.uuid(),
  agedToLostDelayedBilling: {
    lostItemHasBeenBilled: () => false,
    dateLostItemShouldBeBilled: () => faker.date.past(0.1, faker.date.past(0.1)).toString(),
  },

  afterCreate(loanstorage, server) {
    if (!loanstorage.attrs.loan) {
      const loan = server.create('loan');
      loanstorage.update({ loan });
    }
  }
});

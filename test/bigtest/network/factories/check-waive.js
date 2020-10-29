import { Factory } from 'miragejs';
import faker from 'faker';

export default Factory.extend({
  accountId: () => faker.random.uuid(),
  amount: () => faker.finance.amount().toString(),
  allowed: () => faker.random.boolean(),
  remainingAmount: () => faker.finance.amount().toString()
});

import { Factory } from 'miragejs';
import faker from 'faker';

export default Factory.extend({
  amount: () => faker.finance.amount(),
  comments: () => `STAFF : ${faker.company.catchPhrase()} \n PATRON : ${faker.company.catchPhrase()}`,
  transactionInfo: () => faker.company.catchPhrase(),
  notifyPatron: () => faker.random.boolean(),
  servicePointId: () => faker.random.uuid(),
  userName: () => `${faker.name.lastName()}, ${faker.name.firstName()}`,
  paymentMethod: () => faker.random.word(),
});

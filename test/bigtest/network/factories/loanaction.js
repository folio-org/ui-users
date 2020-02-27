import { Factory } from 'miragejs';
import faker from 'faker';

export default Factory.extend({
  id: () => faker.random.uuid(),
  operation: 'I',
  createdDate: () => faker.date.future(0.1).toString(),

  afterCreate(loanaction, server) {
    if (!loanaction.attrs.loan) {
      const loan = server.create('loan');
      loanaction.update({ loan });
    }
  }
});

import { Factory, faker } from '@bigtest/mirage';

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

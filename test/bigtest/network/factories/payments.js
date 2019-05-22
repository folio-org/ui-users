import { Factory, faker, trait } from '@bigtest/mirage';

export default Factory.extend({

  id: () => faker.random.uuid(),
  nameMethod : (i) => 'Cash' + i,
  allowedRefundMethod : true,
  ownerId : (i) => '4dbc74d7-665c-4b66-a296-949107905cb0' + i,
  metadata : {
    createdDate: faker.date.past(0.1, faker.date.past(0.1)).toString(),
    createdByUserId: () => '2d91d36d-618c-5b36-b4b7-986a041bf397',
    updatedDate: faker.date.past(0.1, faker.date.past(0.1)).toString(),
    updatedByUserId: () => '2d91d36d-618c-5b36-b4b7-986a041bf397'
  },

  // eslint-disable-next-line quote-props
  withAccounts: trait({
    afterCreate(payments, server) {
      const owner = server.create('owner');
      payments.update('ownerId', owner.id);
      payments.save();
    }
  })
});

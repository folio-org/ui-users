import { Factory, faker, trait } from '@bigtest/mirage';

export default Factory.extend({

  id: () => faker.random.uuid(),
  amount : (i) => i * 10 + 100.0,
  remaining :(i) => i * 10 + 100.0,
  status : {
    name : 'Open'
  },
  paymentStatus : {
    name : 'Outstanding'
  },
  feeFineType : (i) => 'Missing item fee' + i,
  feeFineOwner : (i) => 'Main Circ' + i,
  title : (i) => 'GROẞE DUDEN' + i,
  barcode :(i) => '777' + i,
  materialType : 'book',
  location : 'Main Library',
  dueDate : '2019-04-04T18:58:40.000+0000',
  loanId : '8e9f211b-6024-4828-8c14-ace39c6c2863',
  userId : 'da04aaaf-4f1d-42d8-a94d-ce198330659f',
  itemId : '0',
  materialTypeId : '0',
  feeFineId : (i) => 'afacda62-f66c-44cb-be68-02ce37930a8' + i,
  ownerId : (i) => 'b1cd9b8c-101b-41fc-b4a3-69d75d5a971' + i,
  metadata : {
    createdDate: () => '2019-02-05T18:49:20.839+0000',
    createdByUserId: () => '2d91d36d-618c-5b36-b4b7-986a041bf397',
    updatedDate: () => '2019-02-05T18:49:20.839+0000',
    updatedByUserId: () => '2d91d36d-618c-5b36-b4b7-986a041bf397'
  },

  // eslint-disable-next-line quote-props
  withAccounts: trait({
    afterCreate(accounts, server) {
      const owneraccount = server.create('owner');
      const feefinesaccount = server.create('feefines');
      accounts.update('ownerId', owneraccount.id);
      accounts.update('feeFineId', feefinesaccount.id);
      accounts.save();
    }
  })

});

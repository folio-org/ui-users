import { Factory, faker } from '@bigtest/mirage';

export default Factory.extend({
  id: () => faker.random.uuid(),
  accountId: '8fd350aa-f6f5-44ec-ace3-0b96d72d20e5',
  amountAction: 10,
  balance: 10,
  comments: (i) => 'This is a comment' + i,
  createdAt: 'Main Circ',
  dateAction: '2019-04-22T22:07:07.343+0000',
  source: 'ADMINISTRATOR, DIKU',
  transactionInformation: '-',
  typeAction: 'Late',
  userId: '2da52ef1-81b8-4d7d-9b56-aba7f6885a72'
});

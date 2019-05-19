import { Factory, faker } from '@bigtest/mirage';

export default Factory.extend({
  id: () => faker.random.uuid(),
  owner: (i) => 'Main Admin' + i,
  desc: (i) => 'Main Library Office Desk' + i,
  metadata: {
    createdDate: () => '2019-02-05T18:49:20.839+0000',
    createdByUserId: () => 'ce0e0d5b-b5f3-4ad5-bccb-49c0784298fd',
    updatedDate: () => '2019-02-05T18:49:20.839+0000',
    updatedByUserId: () => 'ce0e0d5b-b5f3-4ad5-bccb-49c0784298fd'
  },
  servicePointOwner: [],
});

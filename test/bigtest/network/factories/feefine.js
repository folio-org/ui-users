import { Factory, faker } from '@bigtest/mirage';

export default Factory.extend({
  id: () => faker.random.uuid(),
  // ownerId: () => faker.random.uuid(),
  feeFineType : (i) => 'Damage camera fee' + i,
  defaultAmount : (i) => 1000.0 + i * 10,

  metadata: {
    createdDate: () => '2019-02-05T18:49:20.839+0000',
    createdByUserId: () => 'ce0e0d5b-b5f3-4ad5-bccb-49c0784298fd',
    updatedDate: () => '2019-02-05T18:49:20.839+0000',
    updatedByUserId: () => 'ce0e0d5b-b5f3-4ad5-bccb-49c0784298fd'
  },
  servicePointOwner: [],
  afterCreate(feefine, server) {
    if (!feefine.attrs.ownerId) {
      const owner = server.create('owner');
      feefine.update({ ownerId: owner.id });
    }
  }
});

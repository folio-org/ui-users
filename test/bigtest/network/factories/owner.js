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
  afterCreate(owner, server) {
    if (owner.attrs.servicePointOwner.length === 0) {
      let servicePoints = server.schema.servicePoints.all();
      if (servicePoints.length === 0) {
        server.createList('service-point', 3);
      }
      servicePoints = server.schema.servicePoints.all();
      const randomAmount = faker.random.number({ min: 1, max: 3 });

      for (let i = 0; i < randomAmount; i++) {
        const randomServicePointIndex = faker.random.number({
          min: 0,
          max: servicePoints.length - 1
        });

        const randomSP = servicePoints.models[randomServicePointIndex];

        owner.update({
          servicePointOwner: [...owner.attrs.servicePointOwner, { value: randomSP.attrs.id, label: randomSP.attrs.name }]
        });
      }
    }
  }
});

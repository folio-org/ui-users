import { Factory, faker } from '@bigtest/mirage';

export default Factory.extend({
  id: faker.random.uuid(),
  servicePointsIds: [
    '82cb6fa0-f70b-4676-8b8f-95ef9d0d28e3',
    'eba14df5-0a84-4348-89dd-a370c2611289'
  ],
  defaultServicePointId : '82cb6fa0-f70b-4676-8b8f-95ef9d0d28e3',
  afterCreate(servicePointUser, server) {
    if (!servicePointUser.attrs.userId) {
      const user = server.create('user');
      servicePointUser.update({ userId: user.id });
    }
  }
});

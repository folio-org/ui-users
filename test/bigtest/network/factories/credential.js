import { Factory } from 'miragejs';
import faker from 'faker';

export default Factory.extend({
  id: () => faker.random.uuid(),
  userId: () => faker.random.uuid(),
  hash: '74B44431F0F9E0FD13385B4610D24B1A1C369E8C',
  salt: '66268FAF2435F891DE2EA55AF47A03F2C37AE029',
  afterCreate(credential, server) {
    if (!credential.attrs.userId) {
      const user = server.create('user');
      credential.update({ userId: user.id });
    }
  }
});

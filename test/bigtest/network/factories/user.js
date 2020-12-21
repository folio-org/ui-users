import { Factory, trait } from 'miragejs';
import faker from 'faker';

export default Factory.extend({
  id: (i) => 'userId' + i,
  barcode: (i) => 'testBarcode' + i,
  active: () => faker.random.boolean(),
  username: () => faker.internet.userName(),
  patronGroup: () => faker.random.arrayElement([
    'group1',
    'group2',
    'group3',
    'group4',
    'group5',
    'group6',
    'group7',
  ]),
  enrollmentDate: () => '2015-12-14T00:00:00.000+0000',
  expirationDate: () => faker.date.future(10),
  createdDate: () => '2018-11-20T11:42:53.385+0000',
  updatedDate: () => '2018-11-20T20:00:47.409+0000',
  customFields: {
    'textbox-1': faker.lorem.sentence(),
    'textbox-2': faker.lorem.sentence(),
    'textarea-3': faker.lorem.sentence(),
    'textarea-4': ''
  },
  departments: [],

  afterCreate(user, server) {
    server.create('service-points-user', {
      'userId': user.id,
      'servicePointsIds': ['servicepointId1', 'servicepointId2'],
      'defaultServicePointId': 'servicepointId1',
    });

    const personal = server.create('user-personal', {
      lastName: faker.name.lastName(),
      firstName: faker.name.firstName(),
    });

    if (user.username) {
      server.create('credential', {
        'userId': user.id,
        'username': user.username,
        'password': faker.internet.password(),
      });
    }

    user.update('username', `${personal.lastName}, ${personal.firstName}`);
    user.update('personal', personal.toJSON());
    user.save();
  },
  withPatronGroup: trait({
    afterCreate(patronGroup, server) {
      server.create('patron-group', { patronGroup });
    }
  }),
});

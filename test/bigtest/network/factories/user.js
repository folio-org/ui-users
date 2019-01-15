import { Factory, faker } from '@bigtest/mirage';

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
  expirationDate: () => '2020-04-07T00:00:00.000+0000',
  createdDate: () => '2018-11-20T11:42:53.385+0000',
  updatedDate: () => '2018-11-20T20:00:47.409+0000',

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

    user.update('username', `${personal.lastName}, ${personal.firstName}`);
    user.update('personal', personal.toJSON());
    user.save();
  }
});

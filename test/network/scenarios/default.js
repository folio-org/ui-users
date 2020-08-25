/* istanbul ignore file */

// default scenario is used during `yarn start --mirage`
export default (server) => {
  server.create('service-point', {
    'id': 'servicepointId1',
    'name': 'Circ Desk 1',
    'code': 'cd1',
    'discoveryDisplayName': 'Circulation Desk -- Hallway',
  });

  server.create('service-point', {
    'id': 'servicepointId2',
    'name': 'Circ Desk 2',
    'code': 'cd2',
    'discoveryDisplayName': 'Circulation Desk -- Back Entrance',
  });

  server.createList('user', 20);

  server.createList('note-type', 10);
  server.createList('note', 40);
};

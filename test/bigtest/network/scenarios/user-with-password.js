export default (server) => {
  const user = server.create('user', {
    id: 'userId',
    username: 'userTest'
  });

  server.get('credential', {
    userId: user.id,
    hash: 'B13F71D6AF823020B3D8B95CEE1D1D78392B4FE7'
  });
};

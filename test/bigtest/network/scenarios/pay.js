export default (server) => {
  const user = server.create('user', { id: '1ad737b0-d847-11e6-bf26-cec0c932ce02' });
  const account = server.create('account', { userId: user.id });
  server.createList('owner', 5);
  server.createList('feefine', 5);
  server.createList('feefineaction', 5, { accountId: account.id });
  server.createList('account', 3, { userId: user.id });

  server.get('/accounts');
  server.get('/users');
  server.get('/owners');
  server.get('/feefines');
  server.get('/feefineactions');
};

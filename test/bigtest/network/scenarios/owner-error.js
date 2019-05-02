export default (server) => {
  server.get('owners');
  server.createList('owners', 5);

  server.delete('/owners/:id', {
    errors: [{
      title: 'An error has occurred'
    }]
  }, 500);
};

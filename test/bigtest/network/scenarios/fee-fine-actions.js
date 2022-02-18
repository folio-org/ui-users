export default (server) => {
  server.get('/feefineactions', {
    feefineactions: [
      {
        id: 'test-1',
      },
    ],
  });
};

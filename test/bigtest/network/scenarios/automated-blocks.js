/* istanbul ignore file */
export default (server) => {
  const user = server.create('user', { id: 'user1' });

  const patronBlock = {
    automatedPatronBlocks: {
      patronBlockConditionId: '1',
      blockBorrowing: true,
      blockRenewals: false,
      blockRequests: false,
      message: 'Patron has reached maximum allowed number of items charged out'
    },
    totalRecords: 1,
  };

  server.get(`/automated-patron-blocks/${user.id}`, patronBlock);
};

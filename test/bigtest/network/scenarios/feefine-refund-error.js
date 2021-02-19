export default server => {
  server.post('/feefine-reports/refund', {
    errors: [{
      message: 'error message',
    }],
  }, 422);
};

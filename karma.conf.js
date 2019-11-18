/** @param {import('karma').Config} config */
module.exports = config => {
  config.set({
    client: {
      captureConsole: false,
      mocha: {
        timeout: 4000,
      },
    }
  });
};

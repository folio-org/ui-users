/** @param {import('karma').Config} config */
module.exports = config => config.set({
  client: {
    captureConsole: false,
    mocha: {
      timeout: 20000
    },
  },
  browserDisconnectTimeout: 20000,
  browserDisconnectTolerance: 10,
  browserNoActivityTimeout: 20000,
  flags: [
    '--disable-gpu',
    '--no-sandbox'
  ],
});

/** @param {import('karma').Config} config */
module.exports = config => config.set({
  client: {
    captureConsole: false,
    mocha: {
      timeout: 100000
    },
  },
  browserDisconnectTimeout: 100000,
  browserDisconnectTolerance: 10,
  browserNoActivityTimeout: 100000,
  flags: [
    '--disable-gpu',
    '--no-sandbox'
  ],
});

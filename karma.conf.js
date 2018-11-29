module.exports = (config) => {
  const testIndex = './test/bigtest/index.js';
  const preprocessors = {};

  preprocessors[`${testIndex}`] = ['webpack'];

  const configuration = {
    files: [
      { pattern: testIndex, watched: false },
    ],
    preprocessors,
  };

  // Turn on coverage report thresholds when coverage reach sufficient level
  /*
  if (configuration.coverageIstanbulReporter) {
    configuration.coverageIstanbulReporter.thresholds.global = {
      statements: 95,
      branches: 85, // should be raised after getting this % up
      functions: 95,
      lines: 95
    };
  }
  */
  config.set(configuration);
};

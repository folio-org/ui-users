import path from 'node:path';
import jcs from '@folio/jest-config-stripes';
const { config, axe } = jcs;

const jconfig = {
  ...config,
  setupFiles: [
    ...config.setupFiles,
    path.join(import.meta.dirname, './test/jest/setupFiles.js'),
  ],
/*
  moduleNameMapper: {
    ...config.moduleNameMapper,
    '^helpers/(.*)$': '<rootDir>/test/jest/helpers/$1',
    '^fixtures/(.*)$': '<rootDir>/test/jest/fixtures/$1',
    '^__mock__$': '<rootDir>/test/jest/__mock__/index.js',
    '^__mock__/(.*)$': '<rootDir>/test/jest/__mock__/$1',
  },
*/
};

export default jconfig;

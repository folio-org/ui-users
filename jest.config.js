const path = require('path');
const config = require('@folio/jest-config-stripes');

module.exports = {
  ...config,
  setupFiles: [
    ...config.setupFiles,
    path.join(__dirname, './test/jest/setupFiles.js'),
  ],
  transformIgnorePatterns: [
    '/node_modules/(?!(@folio|@json2csv|decode-uri-component|filter-obj|find-up|get-stdin|global-dirs|import-lazy|inquirer|is-path-inside|jspdf|keyboardjs|ky|query-string|resolve-from|resolve-pkg|split-on-first|uuid)/)',
  ],
};

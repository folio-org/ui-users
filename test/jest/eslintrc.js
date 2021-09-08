module.exports = {
  'extends': ['@folio/eslint-config-stripes'],
  'parser': '@babel/eslint-parser',
  'overrides': [
    {
      'files': ['src/**/tests/*', 'test/**/*'],
    }
  ],
  'env': {
    'jest': true
  }
};

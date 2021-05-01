const jestE2e = require('./jest-e2e.json');

module.exports = {
  ...jestE2e,
  testRegex: undefined,
  testMatch: ['**/*.spec.ts', '**/*.e2e-spec.ts'],
  collectCoverageFrom: [
    'src/**/*.(t|j)s',
    'libs/**/*.(t|j)s',
    '!src/**/migrations/**/*.(t|j)s',
    '!libs/**/migrations/**/*.(t|j)s',
  ],
};

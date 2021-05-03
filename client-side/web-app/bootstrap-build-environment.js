const { boolean } = require('not-me/lib/schemas/boolean/boolean-schema');

exports.ALL_BUILD_VARIANTS = {
  DEBUG: 'debug',
  RELEASE: 'release',
};

exports.currentBuildVariant = (() => {
  switch (process.env.NODE_ENV) {
    case 'development':
      return exports.ALL_BUILD_VARIANTS.DEBUG;
    case 'production':
      return exports.ALL_BUILD_VARIANTS.RELEASE;
    default:
      throw new Error('Unknown environment. Make sure NODE_ENV is set.');
  }
})();

const CI = boolean().validate(process.env.CI);

if (CI.errors) {
  console.error(`Invalid CI environment variable: ${process.env.CI}`);
  throw new Error();
}

exports.isCI = CI.value;
exports.isNotCI = !CI.value;

const tsConfigFileName =
  exports.currentBuildVariant === exports.ALL_BUILD_VARIANTS.DEBUG
    ? 'tsconfig.json'
    : `tsconfig.${exports.currentBuildVariant}.json`;

require('ts-node').register({
  transpileOnly: true,
  project: tsConfigFileName,
});

const tsConfig = require(`./${tsConfigFileName}`);
const tsConfigPaths = require('tsconfig-paths');

tsConfigPaths.register({
  baseUrl: './',
  paths: tsConfig.compilerOptions.paths,
});

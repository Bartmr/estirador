if (process.env.IS_INTEGRITY_CHECK === 'true') {
  require('dotenv').config({
    path: '.env.development',
  });
}

const tsConfigFileName = 'tsconfig.json';

require('ts-node').register({
  transpileOnly: true,
  project: tsConfigFileName,
  compilerOptions: {
    module: 'commonjs',
    target: 'es2020',
  },
});

const tsConfig = require(`./${tsConfigFileName}`);
const tsConfigPaths = require('tsconfig-paths');

tsConfigPaths.register({
  baseUrl: './',
  paths: tsConfig.compilerOptions.paths,
});

// Validate environment variables
require('./src/logic/app-internals/runtime/environment-variables');

const { NEXT_CONFIG } = require('./src/next.config');

module.exports = NEXT_CONFIG;

if (
  process.env.NODE_ENV === 'development' ||
  process.env.IS_INTEGRITY_CHECK === 'true'
) {
  require('dotenv').config({
    path: '.env.development',
  });
}

const tsConfigFileName = 'tsconfig.typecheck.json';

require('ts-node').register({
  transpileOnly: true,
  project: tsConfigFileName,
  compilerOptions: {
    module: 'commonjs',
    target: 'es2021',
  },
});

const tsConfigForTypecheck = require(`./tsconfig.json`);
const tsConfigPaths = require('tsconfig-paths');

tsConfigPaths.register({
  baseUrl: './',
  paths: tsConfigForTypecheck.compilerOptions.paths,
});

// Validate environment variables
require('./src/logic/app-internals/runtime/environment-variables');

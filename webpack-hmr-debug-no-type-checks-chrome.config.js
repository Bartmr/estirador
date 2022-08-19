const webpackHMRDebugNoTypeChecksConfig = require('./webpack-hmr-debug-no-type-checks.config');

module.exports = function (options, webpack) {
  return {
    ...webpackHMRDebugNoTypeChecksConfig(options, webpack),
    devtool: 'inline-source-map',
  };
};

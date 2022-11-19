const webpackHMRDebugConfig = require('./webpack-hmr-debug.config');

module.exports = function (options, webpack) {
  return {
    ...webpackHMRDebugConfig(options, webpack),
    devtool: 'inline-source-map',
  };
};

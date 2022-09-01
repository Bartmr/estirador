const webpackHMRConfigNoTypeChecks = require('./webpack-hmr-no-type-checks.config');

module.exports = function (options, webpack) {
  return {
    ...webpackHMRConfigNoTypeChecks(options, webpack),
    devtool: 'inline-source-map',
  };
};

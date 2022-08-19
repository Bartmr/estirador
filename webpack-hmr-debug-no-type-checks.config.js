const webpackHMRNoTypeChecksConfig = require('./webpack-hmr-no-type-checks.config');

module.exports = function (options, webpack) {
  return {
    ...webpackHMRNoTypeChecksConfig(options, webpack, [
      '--inspect=9229',
      '--nolazy',
    ]),
    devtool: 'eval-cheap-module-source-map',
  };
};

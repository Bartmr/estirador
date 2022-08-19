const webpackHMRConfig = require('./webpack-hmr.config');

module.exports = function (options, webpack) {
  return {
    ...webpackHMRConfig(options, webpack, ['--inspect=9229', '--nolazy']),
    devtool: 'eval-cheap-module-source-map',
  };
};

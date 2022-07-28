const webpackHMRConfig = require('./webpack-hmr.config');

module.exports = function (options, webpack) {
  return webpackHMRConfig(options, webpack, ['--inspect=9229']);
};

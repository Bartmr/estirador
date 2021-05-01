const webpackHMRNoTypeChecksConfig = require('./webpack-hmr-no-type-checks.config');

module.exports = function (options, webpack) {
  return webpackHMRNoTypeChecksConfig(options, webpack, ['--inspect-brk=9229']);
};

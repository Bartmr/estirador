const webpackHMRConfig = require('./webpack-hmr.config');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = function (options, webpack, nodeArgs) {
  let tsLoader;

  for (const rule of options.module.rules) {
    for (const loader of rule.use) {
      if (loader.loader === 'ts-loader') {
        tsLoader = loader;
        break;
      }
    }

    if (tsLoader) break;
  }

  if (!tsLoader) {
    throw new Error();
  }

  tsLoader.options.transpileOnly = true;
  delete tsLoader.options.getCustomTransformers;

  const _plugins = options.plugins.filter(
    (plugin) => !(plugin instanceof ForkTsCheckerWebpackPlugin),
  );

  options.plugins = _plugins;

  return webpackHMRConfig(options, webpack, nodeArgs);
};

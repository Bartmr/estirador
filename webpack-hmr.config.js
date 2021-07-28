const nodeExternals = require('webpack-node-externals');
const { RunScriptWebpackPlugin } = require('run-script-webpack-plugin');

const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const glob = require('glob');
const path = require('path');

const HOT_ENTRY = 'webpack/hot/poll?500';

module.exports = function (options, webpack, nodeArgs) {
  const _plugins = options.plugins.filter(
    (plugin) => !(plugin instanceof ForkTsCheckerWebpackPlugin),
  );

  options.plugins = _plugins;

  const jobFiles = glob.sync('src/**/*.job.ts');

  const jobFilesEntryPoints = {};

  jobFiles.forEach((jobFile) => {
    const splitted = jobFile.split('.');
    splitted.pop();
    const jobName = splitted.join('.');
    jobFilesEntryPoints[jobName] = './' + jobFile;
  });

  return {
    ...options,
    mode: 'development',
    devtool: 'inline-source-map',
    entry: {
      main: [HOT_ENTRY, './src/main.ts'],
      ...jobFilesEntryPoints,
    },
    output: {
      filename: '[name].js',
      path: path.join(__dirname, 'dist'),
    },
    externals: [
      nodeExternals({
        allowlist: [HOT_ENTRY],
      }),
    ],
    plugins: [
      ...options.plugins,
      new webpack.HotModuleReplacementPlugin(),
      new webpack.WatchIgnorePlugin({
        paths: [/\.js$/, /\.d\.ts$/],
      }),
      new RunScriptWebpackPlugin({
        name: 'main.js',
        nodeArgs,
      }),
    ],
  };
};

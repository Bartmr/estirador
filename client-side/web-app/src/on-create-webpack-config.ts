/* eslint-disable no-console */
import { CreateWebpackConfigArgs } from 'gatsby';

import path from 'path';
import { promisify } from 'util';
import childProcess from 'child_process';

import { EnvironmentVariables } from './logic/app-internals/runtime/environment-variables';
import {
  GatsbyBuildTimeStore,
  GRAPHQL_TYPESCRIPT_GENERATOR_COMMAND,
  pathExists,
  saveGraphQLSchemaToFile,
} from './gatsby-build-utils';
import type webpack from 'webpack';

const exec = promisify(childProcess.exec);

//
//

const isMiniCssExtractPluginInstance = (
  plugin: webpack.WebpackPluginInstance,
): plugin is webpack.WebpackPluginInstance & {
  options?: { experimentalUseImportModule?: boolean };
} => {
  return plugin.constructor.name === 'MiniCssExtractPlugin';
};

//
//

export async function onCreateWebpackConfig({
  store,
  actions,
  getConfig,
}: CreateWebpackConfigArgs) {
  // eslint-disable-next-line node/no-process-env
  if (process.env['NODE_ENV'] === 'development') {
    await saveGraphQLSchemaToFile(store as unknown as GatsbyBuildTimeStore);

    const graphqlTypingsExist = await pathExists(
      '_graphql-generated_/typescript',
    );

    if (!graphqlTypingsExist) {
      console.info(
        'Generating Typescript typings of GraphQL queries for the first time...',
      );

      await exec(GRAPHQL_TYPESCRIPT_GENERATOR_COMMAND);
    }
  } else if (EnvironmentVariables.IS_INTEGRITY_CHECK) {
    await saveGraphQLSchemaToFile(store as unknown as GatsbyBuildTimeStore);
    await exec(GRAPHQL_TYPESCRIPT_GENERATOR_COMMAND);
  }

  const config = getConfig() as webpack.Configuration;

  actions.replaceWebpackConfig({
    ...config,
    resolve: {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        /*
          Absolute imports should only be allowed to import from inside the `src` directory.
  
          This is to avoid build configurations
          and code with sensible information used at build time
          from being bundled with the client-side code.
  
          That's why we use a `src` alias instead of
          pointing the imports root directly to the root of the project.
        */
        src: path.join(process.cwd(), `src`),
        typeorm: path.join(
          process.cwd(),
          '../../node_modules/typeorm/typeorm-model-shim.js',
        ),
        '@app/shared': EnvironmentVariables.CI
          ? path.join(process.cwd(), 'dist/libs/shared/src')
          : path.join(process.cwd(), '../../libs/shared/src'),
      },
    },
    plugins: config.plugins?.map((plugin) => {
      if (isMiniCssExtractPluginInstance(plugin)) {
        plugin.options = {
          ...plugin.options,
          experimentalUseImportModule: true,
        };
      }

      return plugin;
    }),
  });
}

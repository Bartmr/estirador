/* eslint-disable no-console */
import { CreateDevServerArgs } from 'gatsby';

import childProcess from 'child_process';
import {
  GatsbyBuildTimeStore,
  GRAPHQL_TYPESCRIPT_GENERATOR_COMMAND,
  saveGraphQLSchemaToFile,
} from './gatsby-build-utils';

type Chunk = {
  toString: () => string;
};

export async function onCreateDevServer({ store }: CreateDevServerArgs) {
  try {
    const { spawn } = childProcess;

    await saveGraphQLSchemaToFile(store as unknown as GatsbyBuildTimeStore);

    const graphqlTypescriptGeneratorWatcherProcess = spawn(
      GRAPHQL_TYPESCRIPT_GENERATOR_COMMAND + ' --watch',
      {
        shell: true,
      },
    );

    graphqlTypescriptGeneratorWatcherProcess.stdout.on(
      'data',
      function (data: Chunk) {
        console.info(`stdout: ${data.toString()}`);
      },
    );

    graphqlTypescriptGeneratorWatcherProcess.stderr.on(
      'data',
      function (data: Chunk) {
        console.error(`stderr: ${data.toString()}`);
      },
    );

    graphqlTypescriptGeneratorWatcherProcess.on('exit', function (code) {
      if (code !== 0) {
        console.error(
          `${GRAPHQL_TYPESCRIPT_GENERATOR_COMMAND} exited with code ${
            code || 'null'
          }`,
        );
        process.exit(1);
      } else {
        console.info(
          `${GRAPHQL_TYPESCRIPT_GENERATOR_COMMAND} exited correctly.`,
        );
      }
    });
  } catch (error: unknown) {
    console.error(error);
    process.exit(1);
  }
}

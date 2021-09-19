/* eslint-disable no-console */
import { spawn } from 'child_process';
import { CreateDevServerArgs } from 'gatsby';

import {
  GatsbyBuildTimeStore,
  GRAPHQL_TYPESCRIPT_GENERATOR_COMMAND,
  saveGraphQLSchemaToFile,
} from './gatsby-build-utils';

type Chunk = {
  toString: () => string;
};

export async function onCreateDevServer({ store }: CreateDevServerArgs) {
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
}

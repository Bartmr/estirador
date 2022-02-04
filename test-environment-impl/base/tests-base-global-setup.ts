import { hotReloadDatabases } from 'src/internals/databases/hot-reload-databases';
import { NODE_ENV } from 'src/internals/environment/node-env.constants';
import { NodeEnv } from 'src/internals/environment/node-env.types';

if (NODE_ENV !== NodeEnv.Test) {
  throw new Error();
}

export async function testsBaseGlobalSetup() {
  await hotReloadDatabases();
}

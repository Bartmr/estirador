import path from 'path';
import fs from 'fs';
import { hotReloadDatabases } from 'src/internals/databases/hot-reload-databases';
import { NODE_ENV } from 'src/internals/environment/node-env.constants';
import { NodeEnv } from 'src/internals/environment/node-env.types';

if (NODE_ENV !== NodeEnv.Test) {
  throw new Error();
}

const typeormConfigPath = path.join(
  process.cwd(),
  'src/internals/databases/typeorm-ormconfig-with-migrations.ts',
);
const allMigrationsArrayPath = path.join(
  process.cwd(),
  'src/internals/databases/all-migrations.ts',
);
const migrationsDirectoryPath = path.join(
  process.cwd(),
  'src/internals/databases/migrations',
);

if (
  !(
    fs.existsSync(typeormConfigPath) &&
    fs.existsSync(allMigrationsArrayPath) &&
    fs.existsSync(migrationsDirectoryPath)
  )
) {
  throw new Error(
    'A module that is supposed to be hot reloaded cannot be found anymore',
  );
}

export async function testsBaseGlobalSetup() {
  /*
    Hot reload the database migrations that prepare the test environment
  */
  Object.keys(require.cache).forEach(function (absolutePath) {
    if (
      absolutePath === typeormConfigPath ||
      absolutePath === allMigrationsArrayPath ||
      absolutePath.startsWith(migrationsDirectoryPath)
    ) {
      delete require.cache[absolutePath];
    }
  });

  const connections = await hotReloadDatabases();

  await Promise.all(connections.map((c) => c.close()));
}

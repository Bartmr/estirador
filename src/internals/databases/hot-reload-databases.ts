import path from 'path';
import fs from 'fs';
import { NODE_ENV } from '../environment/node-env.constants';
import { NodeEnv } from '../environment/node-env.types';
import { HOT_RELOAD_DATABASE_MIGRATIONS_ROLLBACK_STEPS } from './databases-constants';
import { MigrationExecutor, ConnectionManager } from 'typeorm';

if (NODE_ENV !== NodeEnv.Development && NODE_ENV !== NodeEnv.Test) {
  throw new Error();
}

export async function hotReloadDatabases(): Promise<void> {
  if (!module.hot) {
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
      throw new Error();
    }

    Object.keys(require.cache).forEach(function (absolutePath) {
      if (
        absolutePath === typeormConfigPath ||
        absolutePath === allMigrationsArrayPath ||
        absolutePath.startsWith(migrationsDirectoryPath)
      ) {
        delete require.cache[absolutePath];
      }
    });
  }

  const { TYPEORM_ORMCONFIG_WITH_MIGRATIONS } = await import(
    './typeorm-ormconfig-with-migrations'
  );

  const connectionManager = new ConnectionManager();

  const connections = await Promise.all(
    TYPEORM_ORMCONFIG_WITH_MIGRATIONS.map(async (cOptions) => {
      const connection = connectionManager.create(cOptions);
      return connection.connect();
    }),
  );

  await Promise.all(
    connections.map(async (connection) => {
      const migrationExecutor = new MigrationExecutor(connection);

      for (let i = 0; i < HOT_RELOAD_DATABASE_MIGRATIONS_ROLLBACK_STEPS; i++) {
        await migrationExecutor.undoLastMigration();
      }

      const pendingMigrations =
        await migrationExecutor.executePendingMigrations();

      // eslint-disable-next-line no-console
      console.info(
        `\nHOT_RELOAD_DATABASE_MIGRATIONS: Executed migrations: ${pendingMigrations.reduce(
          (acc, migration) => {
            return acc + '\n' + migration.name;
          },
          '',
        )}\n`,
      );
    }),
  );

  await Promise.all(connections.map((c) => c.close()));
}

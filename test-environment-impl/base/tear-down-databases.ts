import { NODE_ENV } from 'src/internals/environment/node-env.constants';
import { NodeEnv } from 'src/internals/environment/node-env.types';
import {
  Connection,
  ConnectionManager,
  MigrationExecutor,
} from 'typeorm-bartmr';
import { TYPEORM_ORMCONFIG_WITH_MIGRATIONS } from 'src/internals/databases/typeorm-ormconfig-with-migrations';

if (NODE_ENV !== NodeEnv.Development && NODE_ENV !== NodeEnv.Test) {
  throw new Error();
}

export async function tearDownDatabases(connectionsArg?: Connection[]) {
  /*
    Right now the default teardown is rolling back all migrations,
    since it's the safest (but definitely not the fastest) method for projects that
    share the same database but each write their own part.
  */

  const connectionManager = new ConnectionManager();

  const connections = connectionsArg
    ? connectionsArg
    : await Promise.all(
        TYPEORM_ORMCONFIG_WITH_MIGRATIONS.map(async (cOptions) => {
          const connection = connectionManager.create(cOptions);
          return connection.connect();
        }),
      );

  await Promise.all(
    connections.map(async (connection) => {
      const queryRunner = connection.createQueryRunner();
      const migrationExecutor = new MigrationExecutor(connection, queryRunner);
      const executedMigrations =
        await migrationExecutor.getExecutedMigrations();

      if (!queryRunner.isReleased) {
        await queryRunner.release();
      }

      const undoMigrationsQueryRunner = connection.createQueryRunner();
      const undoMigrationsMigrationExecutor = new MigrationExecutor(
        connection,
        undoMigrationsQueryRunner,
      );

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for (const _ of executedMigrations) {
        await undoMigrationsMigrationExecutor.undoLastMigration();
      }

      if (!undoMigrationsQueryRunner.isReleased) {
        await undoMigrationsQueryRunner.release();
      }
    }),
  );

  return connections;
}

/* eslint-disable @typescript-eslint/no-var-requires */
import { NODE_ENV } from '../environment/node-env.constants';
import { NodeEnv } from '../environment/node-env.types';
import { HOT_RELOAD_DATABASE_MIGRATIONS_ROLLBACK_STEPS } from './databases-constants';
import {
  MigrationExecutor,
  ConnectionManager,
  Connection,
} from 'typeorm-bartmr';
import { ConnectionMetadataBuilder } from 'typeorm-bartmr/connection/ConnectionMetadataBuilder';
import { ObjectUtils } from 'typeorm-bartmr/util/ObjectUtils';
import { throwError } from 'libs/shared/src/internals/utils/throw-error';

type ModuleHotData = {
  connections?: Connection[];
};

if (NODE_ENV !== NodeEnv.Development && NODE_ENV !== NodeEnv.Test) {
  throw new Error();
}

export async function hotReloadDatabases(): Promise<Connection[]> {
  const { TYPEORM_ORMCONFIG_WITH_MIGRATIONS } = await import(
    './typeorm-ormconfig-with-migrations'
  );

  const connectionManager = new ConnectionManager();

  let connections: Connection[];

  const moduleHotData = module.hot?.data as ModuleHotData | undefined;

  if (moduleHotData?.connections) {
    const previousConnections = moduleHotData.connections;

    const toRestore: Connection[] = [];

    for (let i = 0; i < previousConnections.length; i++) {
      const connection = previousConnections[i] || throwError();
      const ormConfig = TYPEORM_ORMCONFIG_WITH_MIGRATIONS[i] || throwError();

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      connection.migrations = ormConfig.migrations;

      const connectionMetadataBuilder = new ConnectionMetadataBuilder(
        connection,
      );
      const migrations = connectionMetadataBuilder.buildMigrations(
        ormConfig.migrations || [],
      );
      ObjectUtils.assign(connection, { migrations: migrations });

      toRestore.push(connection);
    }

    connections = toRestore;
  } else {
    connections = await Promise.all(
      TYPEORM_ORMCONFIG_WITH_MIGRATIONS.map(async (cOptions) => {
        const connection = connectionManager.create(cOptions);
        return connection.connect();
      }),
    );
  }

  if (module.hot) {
    module.hot.dispose((data: ModuleHotData) => {
      data.connections = connections;
    });
  }

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

  return connections;
}

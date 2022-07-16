import { NODE_ENV } from '../../environment/node-env.constants';
import { Connection, ConnectionManager } from 'typeorm';
import { NodeEnv } from '../../environment/node-env.types';
import { TYPEORM_ORMCONFIG } from '../typeorm-ormconfig';
import { ConnectionOptions } from 'typeorm';
import { TypeormConnectionName } from '../typeorm-connection-names';

if (NODE_ENV !== NodeEnv.Test) {
  throw new Error();
}

export async function getTestDatabaseConnection(
  entities?: ConnectionOptions['entities'],
  connectionName: TypeormConnectionName = TypeormConnectionName.Default,
): Promise<Connection> {
  const connectionManager = new ConnectionManager();

  const connectionOptions = TYPEORM_ORMCONFIG.find((c) => {
    return (
      c.name === connectionName ||
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      (!c.name && connectionName === TypeormConnectionName.Default)
    );
  });

  if (!connectionOptions) throw new Error();

  const connection = connectionManager.create({
    ...connectionOptions,
    entities: entities,
  });
  return connection.connect();
}

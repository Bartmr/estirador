import { NODE_ENV } from '../../environment/node-env.constants';
import { Connection, ConnectionManager } from 'typeorm';
import { NodeEnv } from '../../environment/node-env.types';
import { TYPEORM_ORMCONFIG } from '../typeorm-ormconfig';
import { ConnectionOptions } from 'typeorm';
import { TYPEORM_DEFAULT_CONNECTION_NAME } from '../databases-constants';

if (NODE_ENV !== NodeEnv.Test) {
  throw new Error();
}

export async function getDatabaseConnection(
  entities?: ConnectionOptions['entities'],
  connectionName = TYPEORM_DEFAULT_CONNECTION_NAME,
): Promise<Connection> {
  const connectionManager = new ConnectionManager();

  const connectionOptions = TYPEORM_ORMCONFIG.find((c) => {
    return (
      c.name === connectionName ||
      (connectionName === TYPEORM_DEFAULT_CONNECTION_NAME && !c.name)
    );
  });

  if (!connectionOptions) throw new Error();

  const connection = connectionManager.create({
    ...connectionOptions,
    entities: entities,
  });
  return connection.connect();
}

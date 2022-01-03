import { DEFAULT_DB_TYPEORM_CONN_OPTS } from 'src/internals/databases/default-db-typeorm-conn-opts';
import { ConnectionManager } from 'typeorm';
import { AUTH_MODULE_ENTITIES } from '../auth-module-entities';
import { AuthTokensRepository } from './auth-token.repository';

/*
  TODO
  setup as cron job
*/

export async function cleanExpiredAuthTokens() {
  const connectionManager = new ConnectionManager();

  const connection = connectionManager.create({
    ...DEFAULT_DB_TYPEORM_CONN_OPTS,
    entities: AUTH_MODULE_ENTITIES,
  });

  await connection.connect();

  const tokensRepository = connection.getCustomRepository(AuthTokensRepository);

  await tokensRepository.deleteExpired();

  await connection.close();
}

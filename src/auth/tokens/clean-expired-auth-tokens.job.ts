import { DEFAULT_DB_TYPEORM_CONN_OPTS } from 'src/internals/databases/default-db-typeorm-conn-opts';
import { prepareJob } from 'src/internals/jobs/run-job';
import { createConnection } from 'typeorm';
import { AUTH_MODULE_ENTITIES } from '../auth-module-entities';
import { AuthTokensRepository } from './auth-token.repository';

/*
  TODO
  setup as chron job
*/

const job = prepareJob('clean-expired-auth-tokens', async () => {
  const connection = await createConnection({
    ...DEFAULT_DB_TYPEORM_CONN_OPTS,
    entities: AUTH_MODULE_ENTITIES,
  });

  const tokensRepository = connection.getCustomRepository(AuthTokensRepository);

  await tokensRepository.deleteExpired();

  await connection.close();
});

job();

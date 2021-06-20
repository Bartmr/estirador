import 'source-map-support/register';
import 'src/internals/environment/load-environment-variables';

import { tearDownDatabases } from 'test-environment-impl/base/tear-down-databases';
import { createConnection } from 'typeorm';
import { NODE_ENV } from 'src/internals/environment/node-env.constants';
import { NodeEnv } from 'src/internals/environment/node-env.types';
import { ProcessContextManager } from 'src/internals/process/process-context-manager';
import { ProcessType } from 'src/internals/process/process-context';
import { generateRandomUUID } from 'src/internals/utils/generate-random-uuid';
import { UsersRepository } from 'src/users/users.repository';
import { createTestAuditContext } from 'src/internals/auditing/spec/create-test-audit-context';
import bcrypt from 'bcrypt';
import { Role } from 'src/auth/roles/roles';

async function seed() {
  if (NODE_ENV === NodeEnv.Development) {
    ProcessContextManager.setContext({
      type: ProcessType.Script,
      name: 'scripts-dev:seed',
      workerId: generateRandomUUID(),
    });

    const { DEFAULT_DATABASE_TYPEORM_CONNECTION_OPTIONS } = await import(
      'src/internals/databases/typeorm-ormconfig-with-migrations'
    );

    const defaultDBConnection = await createConnection({
      ...DEFAULT_DATABASE_TYPEORM_CONNECTION_OPTIONS,
      entities: ['src/**/typeorm/*.entity.ts'],
    });

    await tearDownDatabases([defaultDBConnection]);

    await defaultDBConnection.runMigrations();

    const repository = defaultDBConnection.getCustomRepository(UsersRepository);

    const auditContext = createTestAuditContext();

    const passwordSalt = await bcrypt.genSalt();

    const passwordHash = await bcrypt.hash('password123', passwordSalt);

    await repository.create(
      {
        email: `end-user@email.com`,
        role: Role.EndUser,
        passwordHash,
        passwordSalt,
        isVerified: true,
      },
      auditContext.toPersist,
    );

    await Promise.all([defaultDBConnection.close()]);
  } else {
    throw new Error('Seed command is only for development');
  }
}

seed().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

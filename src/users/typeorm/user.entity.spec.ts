import { Role } from 'src/auth/roles/roles';
import { createAuditContextTestMock } from 'src/internals/auditing/spec/create-test-audit-context';
import { getDatabaseConnection } from 'src/internals/databases/spec/databases-test-utils';
import { Connection } from 'typeorm';
import bcrypt from 'bcrypt';
import type { UsersRepository as UsersRepositoryType } from '../users.repository';

import { generateRandomUUID } from 'src/internals/utils/generate-random-uuid';

const TEST_TABLE_NAME = 'user_entity_test';

let connection: Connection;
let UsersRepository: typeof UsersRepositoryType;

beforeAll(async () => {
  jest.mock('./user-entity-table-name', () => ({
    USER_ENTITY_TABLE_NAME: TEST_TABLE_NAME,
  }));

  const { User } = await import('./user.entity');
  UsersRepository = (await import('../users.repository')).UsersRepository;

  connection = await getDatabaseConnection([User]);

  await connection.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  await connection.query(`DROP TABLE IF EXISTS ${TEST_TABLE_NAME}`);
  await connection.synchronize();
});

afterAll(async () => {
  await connection.close();
});

describe('User entity', () => {
  it('Should not return user credentials on findOne', async () => {
    const repository = connection.getCustomRepository(UsersRepository);

    const auditContextMock = createAuditContextTestMock();

    const passwordSalt = await bcrypt.genSalt();

    const passwordHash = await bcrypt.hash('password123', passwordSalt);

    const testUser = await repository.create(
      {
        email: `${generateRandomUUID()}@test-email.com`,
        role: Role.EndUser,
        passwordHash,
        passwordSalt,
      },
      auditContextMock.auditContext,
    );

    const user = await repository.findOne({
      where: {
        id: testUser.id,
      },
    });

    expect(user?.toJSON()).toEqual({
      ...testUser,
      ...auditContextMock.persisted.auditContextEntityProps,
      passwordHash: undefined,
      passwordSalt: undefined,
    });
  });
});

import { Role } from 'src/auth/roles/roles';
import { createAuditContextTestMock } from 'src/internals/auditing/spec/create-audit-context-test-mock';
import { getDatabaseConnection } from 'src/internals/databases/spec/databases-test-utils';
import { Connection, Entity, EntityRepository } from 'typeorm';
import bcrypt from 'bcrypt';

import { generateRandomUUID } from 'src/internals/utils/generate-random-uuid';
import { _UserBase } from './user.entity';
import { _UsersRepositoryBase } from '../users.repository';

const TEST_TABLE_NAME = 'user_entity_test';

let connection: Connection;

@Entity(TEST_TABLE_NAME)
class TestUser extends _UserBase {}

@EntityRepository(TestUser)
class TestUsersRepository extends _UsersRepositoryBase {}

beforeAll(async () => {
  connection = await getDatabaseConnection([TestUser]);

  await connection.query(`DROP TABLE IF EXISTS ${TEST_TABLE_NAME}`);
  await connection.synchronize();
});

afterAll(async () => {
  await connection.close();
});

describe('User entity', () => {
  it('Should not return user credentials on findOne', async () => {
    const repository = connection.getCustomRepository(TestUsersRepository);

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

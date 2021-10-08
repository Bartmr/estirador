import { createAuditContextTestMock } from 'src/internals/auditing/spec/create-audit-context-test-mock';
import { getDatabaseConnection } from 'src/internals/databases/spec/databases-test-utils';
import { TestApp } from 'src/spec/test-app-types';
import { User } from 'src/users/typeorm/user.entity';
import { UsersRepository } from 'src/users/users.repository';
import { Role } from '../roles/roles';
import supertest from 'supertest';
import { object } from 'not-me/lib/schemas/object/object-schema';
import { string } from 'not-me/lib/schemas/string/string-schema';
import { hashPassword } from 'src/users/hash-password';
import { generateUniqueUUID } from 'src/internals/utils/generate-unique-uuid';

export async function createAuthenticatedHttpAgent(
  app: TestApp,
  newUserOptions?: {
    role?: Role;
  },
) {
  const connection = await getDatabaseConnection([User]);

  const userRepository = connection.getCustomRepository(UsersRepository);

  const auditContextTestMock = createAuditContextTestMock();

  const email = `${generateUniqueUUID()}@email.com`;
  const password = 'password123';

  const { passwordSalt, passwordHash } = await hashPassword(password);

  const newUser = await userRepository.create(
    {
      email,
      passwordSalt,
      passwordHash,
      role: newUserOptions?.role || Role.EndUser,
    },
    auditContextTestMock.auditContext,
  );

  const agentValues = await createAuthenticatedHttpAgentForExistingUser(app, {
    email,
    password,
  });

  return {
    ...agentValues,
    auditContextTestMock,
    newUser,
  };
}

export async function createAuthenticatedHttpAgentForExistingUser(
  app: TestApp,
  existingUserCredentials: {
    email: string;
    password: string;
  },
) {
  const agentBase = supertest.agent(app);

  const loginResponse = await agentBase
    .post('/auth')
    .send(existingUserCredentials);

  const loginResponseValidationResult = object({
    authTokenId: string().filled(),
    session: object({
      userId: string().filled(),
    }),
  })
    .required()
    .validate(loginResponse.body);

  if (loginResponseValidationResult.errors) {
    throw new Error(JSON.stringify(loginResponseValidationResult));
  }

  const loginBody = loginResponseValidationResult.value;

  type Method = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head';

  const hook = (method: Method) => (url: string) =>
    agentBase[method](url).set('Authorization', loginBody.authTokenId);

  const agent = {
    get: hook('get'),
    post: hook('post'),
    put: hook('put'),
    patch: hook('patch'),
    delete: hook('delete'),
    head: hook('head'),
  };

  return {
    agent,
    session: loginBody.session,
  };
}

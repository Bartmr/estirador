import { TestApp } from 'src/spec/test-app-types';
import supertest from 'supertest';
import { object } from 'not-me/lib/schemas/object/object-schema';
import { string } from 'not-me/lib/schemas/string/string-schema';

export async function createAuthenticatedHttpAgent() {
  // app: TestApp,
  // newUserOptions?: {
  //   role?: Role;
  // },

  // TODO: implement
  throw new Error('Not implemented');

  // const agentValues = await createAuthenticatedHttpAgentForExistingUser(app, {
  //   email,
  //   password,
  // });

  // return {
  //   ...agentValues,
  //   auditContextTestMock,
  //   newUser,
  // };
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
    authTokenId: string().required(),
    session: object({
      userId: string().required(),
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

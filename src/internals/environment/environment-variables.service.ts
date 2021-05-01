import { ENVIRONMENT_VARIABLES_VALIDATION_SCHEMA } from './environment-variables.schema';

const results = ENVIRONMENT_VARIABLES_VALIDATION_SCHEMA.validate({
  /*
    Clone enumerable properties to avoid mutability issues
  */
  // eslint-disable-next-line node/no-process-env
  ...process.env,
});

if (results.errors) {
  // eslint-disable-next-line no-console
  console.error('process.env', results.messagesTree);

  throw new Error();
}

const variables = results.value;

export const EnvironmentVariablesService = {
  variables,
};

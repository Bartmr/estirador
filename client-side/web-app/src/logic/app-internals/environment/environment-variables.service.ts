/* eslint-disable node/no-process-env */

import { InferType } from 'not-me/lib/schemas/schema';
import { isRunningOnServer } from '../runtime/is-running-on-server';
import { ENVIRONMENT_VARIABLES_VALIDATION_SCHEMA } from './environment-variables.schema';

function validateVariables() {
  const results = ENVIRONMENT_VARIABLES_VALIDATION_SCHEMA.validate({
    SHOPIFY_STOREFRONT_ACCESS_TOKEN:
      process.env['SHOPIFY_STOREFRONT_ACCESS_TOKEN'],
    SHOPIFY_STOREFRONT_DOMAIN: process.env['SHOPIFY_STOREFRONT_DOMAIN'],
  });

  if (results.errors) {
    // eslint-disable-next-line no-console
    console.error('process.env', results.messagesTree);

    throw new Error();
  }

  return results.value;
}

let variables:
  | undefined
  | InferType<typeof ENVIRONMENT_VARIABLES_VALIDATION_SCHEMA> =
  isRunningOnServer() ? validateVariables() : undefined;

export const EnvironmentVariablesService = {
  getVariables: () => {
    if (!variables) {
      const vars = validateVariables();
      variables = vars;
      return vars;
    }

    return variables;
  },
};

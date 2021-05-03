import { NODE_ENV } from './node-env.constants';
import { NodeEnv } from './node-env.types';
import inspector from 'inspector';
import { object } from 'not-me/lib/schemas/object/object-schema';
import { number } from 'not-me/lib/schemas/number/number-schema';
import { string } from 'not-me/lib/schemas/string/string-schema';
import { boolean } from 'not-me/lib/schemas/boolean/boolean-schema';
import { equals } from 'not-me/lib/schemas/equals/equals-schema';

export const ENVIRONMENT_VARIABLES_VALIDATION_SCHEMA = object({
  HOT_RELOAD_DATABASE_MIGRATIONS_ROLLBACK_STEPS: (() => {
    if (NODE_ENV === NodeEnv.Development || NODE_ENV === NodeEnv.Test) {
      return number().defined();
    } else {
      return number().transform(() => 0);
    }
  })(),

  LOG_DATABASES: boolean(),

  LOG_DEBUG: boolean(),

  LOG_REQUEST_CONTENTS_ON_ERROR: boolean(),

  SHOW_ALL_LOGS_IN_TESTS: boolean(),

  FORK_WORKERS: boolean().transform((value) => {
    if (module.hot || inspector.url()) {
      return false;
    } else if (value === undefined) {
      return true;
    } else {
      return value;
    }
  }),

  ENABLE_SWAGGER: boolean().transform((value) => {
    if (NODE_ENV === NodeEnv.Development) {
      return true;
    } else {
      return value;
    }
  }),

  WEB_APP_ORIGIN: string().filled(),

  DATABASE_HOST: string().filled(),
  DATABASE_PORT: number().defined(),
  DATABASE_NAME: string().filled(),
  DATABASE_USER: string().filled(),
  DATABASE_PASSWORD: string().filled(),

  JWT_ISSUER: (() => {
    if (NODE_ENV === NodeEnv.Test) {
      return equals([undefined]);
    } else {
      return string().filled();
    }
  })(),
  JWT_ACCESS_TOKEN_TTL: number().transform((value) => {
    if (value === undefined) {
      return 60 * 10;
    } else {
      return value;
    }
  }),
  JWT_REFRESH_TOKEN_TTL: number().transform((value) => {
    if (value === undefined) {
      return 60 * 60 * 24 * 30;
    } else {
      return value;
    }
  }),
  JWT_SECRET: string().defined(),
}).defined();

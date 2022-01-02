import { NODE_ENV } from './node-env.constants';
import { NodeEnv } from './node-env.types';
import { object } from 'not-me/lib/schemas/object/object-schema';
import { number } from 'not-me/lib/schemas/number/number-schema';
import { string } from 'not-me/lib/schemas/string/string-schema';
import { boolean } from 'not-me/lib/schemas/boolean/boolean-schema';
import { equals } from 'not-me/lib/schemas/equals/equals-schema';

export const ENVIRONMENT_VARIABLES_VALIDATION_SCHEMA = object({
  HOT_RELOAD_DATABASE_MIGRATIONS_ROLLBACK_STEPS: (() => {
    if (NODE_ENV === NodeEnv.Development || NODE_ENV === NodeEnv.Test) {
      return number().required();
    } else {
      return equals([undefined]).transform(() => 0);
    }
  })(),

  LOG_DATABASES: boolean().notNull(),

  LOG_DEBUG: boolean(),

  LOG_REQUEST_CONTENTS_ON_ERROR: boolean(),

  SHOW_ALL_LOGS_IN_TESTS: boolean(),

  ENABLE_SWAGGER: boolean().transform((value) => {
    if (NODE_ENV === NodeEnv.Development) {
      return true;
    } else {
      return value;
    }
  }),

  WEB_APP_ORIGIN: string().filled(),

  DATABASE_HOST: string().filled(),
  DATABASE_PORT: number().required(),
  DATABASE_NAME: string().filled(),
  DATABASE_USER: string().filled(),
  DATABASE_PASSWORD: string().filled(),

  AUTH_TOKEN_TTL: number()
    .notNull()
    .transform((value) => {
      if (value === undefined) {
        return 60 * 60 * 24 * 30;
      } else {
        return value;
      }
    }),
}).required();

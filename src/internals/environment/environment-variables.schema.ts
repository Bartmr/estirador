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

  WEB_APP_ORIGIN: string()
    .required()
    .transform((s) => s.trim())
    .test((s) => (s.length > 0 ? null : 'Must be filled')),

  DATABASE_HOST: string()
    .required()
    .transform((s) => s.trim())
    .test((s) => (s.length > 0 ? null : 'Must be filled')),
  DATABASE_PORT: number().required(),
  DATABASE_NAME: string()
    .required()
    .transform((s) => s.trim())
    .test((s) => (s.length > 0 ? null : 'Must be filled')),
  DATABASE_USER: string()
    .required()
    .transform((s) => s.trim())
    .test((s) => (s.length > 0 ? null : 'Must be filled')),
  DATABASE_PASSWORD: string()
    .required()
    .transform((s) => s.trim())
    .test((s) => (s.length > 0 ? null : 'Must be filled')),

  AUTH_TOKEN_TTL: number()
    .notNull()
    .transform((value) => {
      if (value === undefined) {
        return 60 * 60 * 24 * 30;
      } else {
        return value;
      }
    }),

  API_PORT: number().transform((v) => {
    if (v == null) {
      return 3000;
    } else {
      return v;
    }
  }),
}).required();

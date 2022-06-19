/* eslint-disable node/no-process-env */
import { boolean } from 'not-me/lib/schemas/boolean/boolean-schema';
import { object } from 'not-me/lib/schemas/object/object-schema';
import { string } from 'not-me/lib/schemas/string/string-schema';

const schema = object({
  HOST_URL: string()
    .required()
    .test((hostUrl) =>
      hostUrl.startsWith('https://') || hostUrl.startsWith('http://')
        ? null
        : 'Must start with http:// or https://',
    )
    .test((hostUrl) =>
      hostUrl.endsWith('/') ? 'Cannot have trailling slash' : null,
    ),
  PATH_PREFIX: string()
    .transform((pathPrefix) => pathPrefix || '')
    .test((pathPrefix) => {
      if (
        pathPrefix === '' ||
        (pathPrefix.startsWith('/') && !pathPrefix.endsWith('/'))
      ) {
        return null;
      } else {
        return 'Path prefix must be either an empty string, or start with a "/" and also NOT end with a "/"';
      }
    }),
  CI: boolean(),
  IS_INTEGRITY_CHECK: boolean(),
  DISABLE_ERROR_BOUNDARIES: boolean(),
  DISABLE_LOGGING_LIMIT: boolean().transform((v) => {
    if (process.env.NODE_ENV === 'development') {
      return true;
    } else {
      return v;
    }
  }),
  LOG_DEBUG: boolean(),
  MAIN_API_URL: string()
    .required()
    .transform((s) => s.trim())
    .test((s) => (s.length > 0 ? null : 'Must be filled')),
}).required();

const environmentVariablesValidationResult = schema.validate({
  HOST_URL: process.env.NEXT_PUBLIC_HOST_URL,
  PATH_PREFIX: process.env.NEXT_PUBLIC_PATH_PREFIX,
  CI: process.env.CI,
  IS_INTEGRITY_CHECK: process.env.IS_INTEGRITY_CHECK,
  DISABLE_ERROR_BOUNDARIES: process.env.NEXT_PUBLIC_DISABLE_ERROR_BOUNDARIES,
  LOG_DEBUG: process.env.NEXT_PUBLIC_LOG_DEBUG,
  MAIN_API_URL: process.env.NEXT_PUBLIC_MAIN_API_URL,
});

if (environmentVariablesValidationResult.errors) {
  throw new Error(
    JSON.stringify(
      environmentVariablesValidationResult.messagesTree,
      undefined,
      2,
    ),
  );
}

export const EnvironmentVariables = environmentVariablesValidationResult.value;

import { object } from 'not-me/lib/schemas/object/object-schema';
import { string } from 'not-me/lib/schemas/string/string-schema';

export const ENVIRONMENT_VARIABLES_VALIDATION_SCHEMA = object({
  SHOPIFY_STOREFRONT_ACCESS_TOKEN: string().filled(),
  SHOPIFY_STOREFRONT_DOMAIN: string().filled(),
}).required();

import { EnumBase } from './enum-types';
import { getEnumValues } from './get-enum-values';

export const isValueFromEnum = <T extends EnumBase>(
  e: T,
  token: unknown,
): token is T[keyof T] => (getEnumValues(e) as unknown[]).includes(token);

import { validate } from 'uuid';

export function isUUID(value: string): boolean {
  return validate(value);
}

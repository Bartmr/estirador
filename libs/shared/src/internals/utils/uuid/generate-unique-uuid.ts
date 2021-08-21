// eslint-disable-next-line node/no-restricted-import
import { v1 } from 'uuid';

export function generateUniqueUUID(): string {
  return v1();
}

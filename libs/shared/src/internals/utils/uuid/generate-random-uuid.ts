// eslint-disable-next-line node/no-restricted-import
import { v4 } from 'uuid';

export function generateRandomUUID(): string {
  return v4();
}

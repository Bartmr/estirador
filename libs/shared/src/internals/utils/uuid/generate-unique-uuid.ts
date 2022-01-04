import { v1 } from 'uuid';

export function generateUniqueUUID(): string {
  return v1();
}

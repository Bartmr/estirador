import { v4 } from 'uuid';

export function generateRandomUUID(): string {
  return v4();
}

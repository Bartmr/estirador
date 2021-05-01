// eslint-disable-next-line node/no-restricted-import
import { v1 } from 'uuid';
import crypto from 'crypto';

const randomBytes = crypto.randomBytes(16);

export function generateSecureUniqueUUID(): string {
  return v1({
    node: randomBytes,
  });
}

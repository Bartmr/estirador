import { string } from 'not-me/lib/schemas/string/string-schema';
import { isUUID } from '../../utils/uuid/is-uuid';

export function uuid(message?: string) {
  return string().test((v) =>
    v == undefined || isUUID(v) ? null : message || 'Must be an UUID',
  );
}

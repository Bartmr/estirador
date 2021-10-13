import { AppServerRequest } from '../server/types/app-server-request-types';
import { generateUniqueUUID } from '../utils/generate-unique-uuid';
import { AuditContext } from './audit-context';

export function attachAuditContext(request: AppServerRequest) {
  request.auditContext = new AuditContext({
    operationId: generateUniqueUUID(),
    requestPath: request.path,
    requestMethod: request.method,
  });
}

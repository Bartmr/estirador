import { AppServerRequest } from '../server/types/app-server-request-types';
import { generateSecureUniqueUUID } from '../utils/generate-secure-unique-uuid';
import { AuditContext } from './audit-context';

export function attachAuditContext(request: AppServerRequest) {
  request.auditContext = new AuditContext({
    operationId: generateSecureUniqueUUID(),
    requestPath: request.path,
    requestMethod: request.method,
    authContext: request.authContext,
  });
}

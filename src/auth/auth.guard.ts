import { CanActivate, ExecutionContext } from '@nestjs/common';
import { AuditContext } from 'src/internals/auditing/audit-context';
import { AppServerRequest } from 'src/internals/server/types/app-server-request-types';
import { generateUniqueUUID } from 'src/internals/utils/generate-unique-uuid';

export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request: AppServerRequest = context
      .switchToHttp()
      .getRequest<AppServerRequest>();

    request.auditContext = new AuditContext({
      operationId: generateUniqueUUID(),
      requestPath: request.path,
      requestMethod: request.method,
    });

    return true;
  }
}

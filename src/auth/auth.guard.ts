import {
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuditContext } from 'src/internals/auditing/audit-context';
import { AppServerRequest } from 'src/internals/server/types/app-server-request-types';
import { generateUniqueUUID } from 'src/internals/utils/generate-unique-uuid';
import {
  PublicRouteMetadata,
  PUBLIC_ROUTE_METADATA_KEY,
} from './public-route.decorator';

export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<true> {
    if (context.getType() !== 'http') {
      throw new Error('Unknown execution context');
    }

    const request: AppServerRequest = context
      .switchToHttp()
      .getRequest<AppServerRequest>();

    request.auditContext = new AuditContext({
      operationId: generateUniqueUUID(),
      requestPath: request.path,
      requestMethod: request.method,
    });

    const isPublic = this.reflector.get<PublicRouteMetadata | undefined>(
      PUBLIC_ROUTE_METADATA_KEY,
      context.getHandler(),
    );

    if (isPublic) {
      return true;
    } else {
      throw new UnauthorizedException();
    }
  }
}

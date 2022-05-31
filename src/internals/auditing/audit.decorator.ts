import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AppServerRequest } from 'src/internals/server/types/app-server-request-types';
import { throwError } from 'src/internals/utils/throw-error';
import { EnforceParameterDecoratorTypesafety } from 'src/internals/utils/typesafe-parameter-decorators';
import { AuditContext } from './audit-context';

export const WithAuditContext = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuditContext => {
    if (ctx.getType() !== 'http') {
      throw new Error('Unknown execution context');
    }

    const request = ctx.switchToHttp().getRequest<AppServerRequest>();

    return request.auditContext ?? throwError();
  },
  [EnforceParameterDecoratorTypesafety(AuditContext)],
);

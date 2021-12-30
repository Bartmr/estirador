import { uuid } from 'libs/shared/src/internals/validation/schemas/uuid.schema';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AppServerRequest } from 'src/internals/server/types/app-server-request-types';
import { AuthContext } from './auth-context';
import { AUTH_TOKEN_HTTP_ONLY_KEY_COOKIE } from './auth.constants';
import { PUBLIC_ROUTE_METADATA_KEY } from './public-route.decorator';
import { ROLES_LEVELS } from './roles/roles';
import {
  ROUTE_ROLES_METADATA_KEY,
  RouteRolesMetadata,
  RolePermissionType,
} from './roles/roles.decorator';
import { AuthTokensService } from './tokens/auth-tokens.service';
import { string } from 'not-me/lib/schemas/string/string-schema';
import { isUUID } from 'src/internals/utils/is-uuid';
import { AuditContext } from 'src/internals/auditing/audit-context';
import { generateUniqueUUID } from 'src/internals/utils/generate-unique-uuid';

const authTokenIdSchema = string()
  .transform((s) => (s ? s.replace('Bearer ', '') : s))
  .test((s) => (s == undefined || isUUID(s) ? null : 'Must be an UUID'));

const authTokenKeySchema = uuid().required();

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private tokensService: AuthTokensService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request: AppServerRequest = context
      .switchToHttp()
      .getRequest<AppServerRequest>();

    request.auditContext = new AuditContext({
      operationId: generateUniqueUUID(),
      requestPath: request.path,
      requestMethod: request.method,
      authContext: null,
    });

    const isPublic = this.reflector.get<boolean | undefined>(
      PUBLIC_ROUTE_METADATA_KEY,
      context.getHandler(),
    );

    const authTokenIdValidationResult = authTokenIdSchema.validate(
      request.header('authorization'),
    );

    if (authTokenIdValidationResult.errors) {
      throw new UnauthorizedException();
    }

    const authTokenId = authTokenIdValidationResult.value;

    if (authTokenId) {
      const authTokenKeyFromCookie = (
        request.cookies as { [key: string]: unknown }
      )[AUTH_TOKEN_HTTP_ONLY_KEY_COOKIE];

      const authTokenKeyValidation = authTokenKeySchema.validate(
        authTokenKeyFromCookie,
      );

      if (authTokenKeyValidation.errors) {
        throw new UnauthorizedException();
      }

      const authTokenKey = authTokenKeyValidation.value;

      const user = await this.tokensService.validateAuthToken(
        authTokenId,
        authTokenKey,
      );

      const authContext = new AuthContext({ user });
      request.authContext = authContext;
      request.auditContext.authContext = authContext;
    }

    if (isPublic) {
      return true;
    } else {
      if (request.authContext) {
        const rolesMetadata = this.reflector.get<RouteRolesMetadata>(
          ROUTE_ROLES_METADATA_KEY,
          context.getHandler(),
        );

        if (rolesMetadata) {
          const currentUserRole = request.authContext.user.role;

          let isAllowed: boolean;

          switch (rolesMetadata.permissionType) {
            case RolePermissionType.UpAndIncluding:
              isAllowed =
                ROLES_LEVELS[currentUserRole] >=
                ROLES_LEVELS[rolesMetadata.role];
              break;
            case RolePermissionType.DownAndIncluding:
              isAllowed =
                ROLES_LEVELS[currentUserRole] <=
                ROLES_LEVELS[rolesMetadata.role];
              break;
            case RolePermissionType.EqualTo:
              isAllowed = rolesMetadata.allowedRoles.includes(currentUserRole);
              break;
            default:
              throw new Error();
          }

          if (isAllowed) {
            return true;
          } else {
            throw new ForbiddenException();
          }
        }

        return true;
      } else {
        throw new UnauthorizedException();
      }
    }
  }
}

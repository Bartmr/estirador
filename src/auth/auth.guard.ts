import { uuid } from '@app/shared/internals/validation/schemas/uuid.schema';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { attachAuditContext } from 'src/internals/auditing/attach-audit-context';
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

const authTokenIdSchema = uuid('Invalid token');

const authTokenKeySchema = uuid('Invalid token').required();

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private tokensService: AuthTokensService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<true> {
    const isPublic = this.reflector.get<boolean | undefined>(
      PUBLIC_ROUTE_METADATA_KEY,
      context.getHandler(),
    );

    const request: AppServerRequest = context
      .switchToHttp()
      .getRequest<AppServerRequest>();

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
        authTokenId.replace('Bearer ', ''),
        authTokenKey,
      );

      request.authContext = new AuthContext({ user });
    }

    attachAuditContext(request);

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

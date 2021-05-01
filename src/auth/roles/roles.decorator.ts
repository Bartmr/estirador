import { SetMetadata } from '@nestjs/common';
import { Role } from './roles';

export enum RolePermissionType {
  UpAndIncluding = 'ui',
  DownAndIncluding = 'di',
  EqualTo = 'e',
}

export type RouteRolesMetadata =
  | undefined
  | {
      permissionType:
        | RolePermissionType.UpAndIncluding
        | RolePermissionType.DownAndIncluding;
      role: Role;
    }
  | {
      permissionType: RolePermissionType.EqualTo;
      allowedRoles: Role[];
    };

export const ROUTE_ROLES_METADATA_KEY = 'route-roles';

export const RolesUpAndIncluding = (role: Role) => {
  const metadata: RouteRolesMetadata = {
    permissionType: RolePermissionType.UpAndIncluding,
    role,
  };
  return SetMetadata(ROUTE_ROLES_METADATA_KEY, metadata);
};
export const RolesDownAndIncluding = (role: Role) => {
  const metadata: RouteRolesMetadata = {
    permissionType: RolePermissionType.DownAndIncluding,
    role,
  };
  return SetMetadata(ROUTE_ROLES_METADATA_KEY, metadata);
};
export const RolesEqualTo = (allowedRoles: Role[]) => {
  const metadata: RouteRolesMetadata = {
    permissionType: RolePermissionType.EqualTo,
    allowedRoles,
  };
  return SetMetadata(ROUTE_ROLES_METADATA_KEY, metadata);
};

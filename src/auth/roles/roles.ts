export enum Role {
  EndUser = 'end-user',
  Admin = 'admin',
}

export const ROLES_LEVELS: { [K in Role]: number } = {
  [Role.EndUser]: 1,
  [Role.Admin]: 2,
};

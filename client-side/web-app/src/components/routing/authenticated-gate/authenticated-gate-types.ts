export enum AuthenticatedGateAccess {
  Allow = 'a',
  Block = 'b',
}

type AuthenticatedGateRule = {
  access: AuthenticatedGateAccess;
  hrefToRedirectTo?: string;
};

export type AuthenticatedGateRules = {
  mainApiSession: AuthenticatedGateRule;
};

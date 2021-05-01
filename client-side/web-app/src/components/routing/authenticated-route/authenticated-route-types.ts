export enum AuthenticatedRouteAccess {
  Allow = 'a',
  Block = 'b',
}

type AuthenticatedRouteRule = {
  access: AuthenticatedRouteAccess;
  hrefToRedirectTo?: string;
};

export type AuthenticatedRouteRules = {
  mainApiSession: AuthenticatedRouteRule;
};

import { INDEX_ROUTE } from '../index/index-routes';

export const LOGIN_ROUTE = {
  label: 'Login',
  path: '/login',
  getHref: ({ next }: { next: string | null }) =>
    `${LOGIN_ROUTE.path}?next=${encodeURIComponent(
      next || INDEX_ROUTE.getHref(),
    )}`,
};

export const LOGIN_ROUTE = {
  label: 'Login',
  path: '/login',
  getHref: ({ next }: { next: string | null }) => {
    const urlSearchParams = new URLSearchParams();

    if (next) {
      urlSearchParams.append('next', next);
    }

    return `${LOGIN_ROUTE.path}?${urlSearchParams.toString()}`;
  },
};

import { useRouter } from 'next/router';

export function useAppNavigation() {
  const router = useRouter();

  const goBack = () => {
    if (!window.history.state) {
      return router.push('/');
    } else {
      return Promise.resolve(window.history.back());
    }
  };

  return {
    navigate: (href: string) => router.push(href),
    navigateWithoutAwaiting: (href: string) => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      router.push(href);
    },
    goBack,
    goBackWithoutAwaiting: () => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      goBack();
    },
  };
}

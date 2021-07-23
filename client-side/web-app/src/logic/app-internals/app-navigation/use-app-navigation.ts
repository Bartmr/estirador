import { useRouter } from 'next/router';
import { COMMON_CONFIG } from '@config/common-config';

const appUrl = COMMON_CONFIG.hostUrl + COMMON_CONFIG.pathPrefix;

export function useAppNavigation() {
  const router = useRouter();

  const pathPrefix = router.basePath;

  let currentHref = router.asPath;
  if (pathPrefix) {
    currentHref = currentHref.replace(pathPrefix, '');
  }

  const goBack = () => {
    if (!window.history.state) {
      return router.push('/');
    } else {
      return Promise.resolve(window.history.back());
    }
  };

  return {
    appUrl,
    pathPrefix,
    currentHref,
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

import { useLocation } from '@reach/router';
import { navigate as navigateWithReachRouter } from '@reach/router';
import { navigate as navigateWithGatsby } from 'gatsby';
import { COMMON_CONFIG } from '@config/common-config';

async function navigate(href: string) {
  if (href.includes('://') || href.includes('?') || href.includes('#')) {
    await navigateWithReachRouter(href);
  } else {
    await navigateWithGatsby(href);
  }
}

const appUrl = COMMON_CONFIG.hostUrl + COMMON_CONFIG.pathPrefix;

export function useAppNavigation() {
  const location = useLocation();

  const pathPrefix = COMMON_CONFIG.pathPrefix;

  let pathname = location.pathname;
  if (pathPrefix) {
    pathname = pathname.replace(pathPrefix, '');
  }

  const currentHref = pathname + location.search + location.hash;

  const goBack = () => {
    if (!window.history.state) {
      return navigate('/');
    } else {
      return Promise.resolve(window.history.back());
    }
  };

  return {
    appUrl,
    pathPrefix,
    currentHref,
    navigate,
    navigateWithoutAwaiting: (href: string) => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      navigate(href);
    },
    goBack,
    goBackWithoutAwaiting: () => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      goBack();
    },
  };
}

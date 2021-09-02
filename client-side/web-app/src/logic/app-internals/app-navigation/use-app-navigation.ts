import { navigate as navigateWithReachRouter } from '@reach/router';
import { navigate as navigateWithGatsby } from 'gatsby';

async function navigate(href: string) {
  if (href.includes('://') || href.includes('?') || href.includes('#')) {
    await navigateWithReachRouter(href);
  } else {
    await navigateWithGatsby(href);
  }
}

export function useAppNavigation() {
  const goBack = () => {
    if (!window.history.state) {
      return navigate('/');
    } else {
      return Promise.resolve(window.history.back());
    }
  };

  return {
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

import { useEffect } from 'react';
import { useAppNavigation } from 'src/logic/app-internals/app-navigation/use-app-navigation';

type Props = {
  href: string;
};

export function Redirect(props: Props) {
  const appNavigation = useAppNavigation();

  useEffect(() => {
    if (props.href.includes('://')) {
      window.location.href = props.href;
    } else {
      appNavigation.navigateWithoutAwaiting(props.href);
    }
  }, []);

  return <></>;
}

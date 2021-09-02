import { navigate } from 'gatsby';
import { useEffect } from 'react';

type Props = {
  href: string;
};

export function Redirect(props: Props) {
  useEffect(() => {
    if (props.href.includes('://')) {
      window.location.href = props.href;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      navigate(props.href);
    }
  }, []);

  return <></>;
}

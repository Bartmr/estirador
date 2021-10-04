import { useEffect } from 'react';
import { useRouter } from 'next/router';

type Props = {
  href: string;
};

export function Redirect(props: Props) {
  const router = useRouter();

  useEffect(() => {
    if (props.href.includes('://')) {
      window.location.href = props.href;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      router.push(props.href);
    }
  }, []);

  return <></>;
}

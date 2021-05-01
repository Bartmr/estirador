import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { IconBase } from './base/icon-base';
import { IconProps } from './base/icon-types';

export function ErrorIcon(props: IconProps) {
  return <IconBase icon={faExclamationCircle} {...props} />;
}

import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { IconBase } from './base/icon-base';
import { IconProps } from './base/icon-types';

export function CancelIcon(props: IconProps) {
  return <IconBase icon={faTimesCircle} {...props} />;
}

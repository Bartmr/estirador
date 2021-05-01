import { faPaste } from '@fortawesome/free-solid-svg-icons';
import { IconBase } from './base/icon-base';
import { IconProps } from './base/icon-types';

export function PasteIcon(props: IconProps) {
  return <IconBase icon={faPaste} {...props} />;
}

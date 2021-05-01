import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { IconBase } from './base/icon-base';
import { IconProps } from './base/icon-types';

export function PlusIcon(props: IconProps) {
  return <IconBase icon={faPlus} {...props} />;
}

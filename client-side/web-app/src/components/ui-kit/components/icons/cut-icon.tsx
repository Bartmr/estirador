import { faCut } from '@fortawesome/free-solid-svg-icons';
import { IconBase } from './base/icon-base';
import { IconProps } from './base/icon-types';

export function CutIcon(props: IconProps) {
  return <IconBase icon={faCut} {...props} />;
}

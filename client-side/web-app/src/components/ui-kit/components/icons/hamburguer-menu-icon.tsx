import { faBars } from '@fortawesome/free-solid-svg-icons';
import { IconBase } from './base/icon-base';
import { IconProps } from './base/icon-types';

export function HamburguerMenuIcon(props: IconProps) {
  return <IconBase icon={faBars} {...props} />;
}

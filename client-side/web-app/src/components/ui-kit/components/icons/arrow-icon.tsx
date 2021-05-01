import {
  faArrowDown,
  faArrowLeft,
  faArrowRight,
  faArrowUp,
} from '@fortawesome/free-solid-svg-icons';
import { IconBase } from './base/icon-base';
import { IconProps } from './base/icon-types';

export enum ArrowIconDirection {
  Up = 'up',
  Right = 'right',
  Down = 'down',
  Left = 'left',
}

const DIRECTED_ICONS = {
  [ArrowIconDirection.Up]: faArrowUp,
  [ArrowIconDirection.Right]: faArrowRight,
  [ArrowIconDirection.Down]: faArrowDown,
  [ArrowIconDirection.Left]: faArrowLeft,
};

export function ArrowIcon(
  props: IconProps & { direction: ArrowIconDirection },
) {
  const icon = DIRECTED_ICONS[props.direction];

  return <IconBase icon={icon} {...props} />;
}

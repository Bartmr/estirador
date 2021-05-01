import { Breakpoint } from 'src/components/ui-kit/core/responsive/breakpoints/breakpoints-types';

export enum IconSize {
  Default = 'inherit',
  Thumbnail = 'thumbnail',
}

export type IconProps = {
  className?: string;
  size?: IconSize | { [K in IconSize]?: Breakpoint };
};

import React from 'react';
import { Breakpoint } from '../../core/responsive/breakpoints/breakpoints-types';

export enum SpinnerSize {
  Small = 'small',
  Default = 'default',
  Large = 'large',
}

const SPINNER_SIZE_CLASS_NAME_MODIFIER = {
  [SpinnerSize.Small]: 'sm',
  [SpinnerSize.Default]: 'default',
  [SpinnerSize.Large]: 'lg',
};

type Props = {
  size?: SpinnerSize | { [K in SpinnerSize]?: Breakpoint };
  style?: React.CSSProperties;
};

export function LoadingSpinner(props: Props) {
  const shadowClass = props.size === SpinnerSize.Large ? 'shadow' : '';
  const paddingClass = props.size === SpinnerSize.Large ? 'p-3' : '';

  let sizeClass = '';

  const size = props.size;

  if (typeof size === 'string') {
    sizeClass = `spinner-${SPINNER_SIZE_CLASS_NAME_MODIFIER[size]}`;
  } else if (typeof size === 'object') {
    sizeClass = Object.keys(size).reduce<string>((acc, c, i) => {
      const sizeKey = c as SpinnerSize;
      const breakpointModifier = size[sizeKey];

      if (!breakpointModifier) return acc;

      return `${acc}${i === 0 ? '' : ' '}spinner-${breakpointModifier}-${
        SPINNER_SIZE_CLASS_NAME_MODIFIER[sizeKey]
      }`;
    }, '');
  }

  return (
    <>
      <div
        className={`w-auto ${shadowClass} rounded-circle ${paddingClass} bg-light`}
        style={{ position: 'relative', zIndex: 1, ...props.style }}
      >
        <div
          className={`${sizeClass} spinner-border text-primary `}
          role="status"
        >
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    </>
  );
}

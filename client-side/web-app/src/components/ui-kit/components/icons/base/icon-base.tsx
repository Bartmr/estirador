import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { IconProps, IconSize } from './icon-types';

const ICON_SIZE_CLASS_NAME_MODIFIER = {
  [IconSize.Default]: `-${IconSize.Default}`,
  [IconSize.Thumbnail]: `-${IconSize.Thumbnail}`,
};

type Props = IconProps & {
  icon: IconDefinition;
};

export function IconBase(props: Props) {
  let sizeClass = '';

  const size = props.size;

  if (typeof size === 'string') {
    sizeClass = `icon${ICON_SIZE_CLASS_NAME_MODIFIER[size]}`;
  } else if (typeof size === 'object') {
    sizeClass = Object.keys(size).reduce<string>((acc, c, i) => {
      const sizeKey = c as IconSize;
      const breakpointModifier = size[sizeKey];

      if (!breakpointModifier) return acc;

      return `${acc}${i === 0 ? '' : ' '}icon-${breakpointModifier}${
        ICON_SIZE_CLASS_NAME_MODIFIER[sizeKey]
      }`;
    }, '');
  }

  return (
    <FontAwesomeIcon
      aria-hidden
      className={`icon ${sizeClass} ${props.className || ''}`}
      icon={props.icon}
      style={props.style}
    />
  );
}

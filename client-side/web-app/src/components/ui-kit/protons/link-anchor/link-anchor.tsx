import { Link } from 'gatsby';
import React, { ReactNode, SyntheticEvent } from 'react';
import { EnvironmentVariables } from 'src/logic/app-internals/runtime/environment-variables';

type Props = {
  children: ReactNode;
  href: string;
  className?: string;
  activeClassName?: string;
  onClick?: (event: SyntheticEvent<HTMLAnchorElement>) => void;
  style?: React.CSSProperties;
  openExternalLinkInSameTab?: boolean;
};

export function LinkAnchor(props: Props) {
  const commonProps = {
    className: props.className,
    style: props.style,
    ...(props.onClick
      ? {
          onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
            if (props.onClick) {
              props.onClick(e);
            }
          },
          onKeyDown: (e: React.KeyboardEvent<HTMLAnchorElement>) => {
            if (e.code === 'Enter' && props.onClick) {
              props.onClick(e);
            }
          },
        }
      : {}),
  };

  if (props.href.includes('://')) {
    return (
      <a
        rel="noopener noreferrer"
        href={props.href}
        target={
          props.href.includes('://') && !props.openExternalLinkInSameTab
            ? '_blank'
            : undefined
        }
        {...commonProps}
      >
        {props.children}
      </a>
    );
  } else if (
    props.href.startsWith('mailto:') ||
    props.href.startsWith('tel:')
  ) {
    return (
      <a href={props.href} {...commonProps}>
        {props.children}
      </a>
    );
  } else if (props.href.includes('#')) {
    return (
      <a href={EnvironmentVariables.PATH_PREFIX + props.href} {...commonProps}>
        {props.children}
      </a>
    );
  } else {
    return (
      <Link
        partiallyActive
        activeClassName={props.activeClassName}
        to={props.href}
        {...commonProps}
      >
        {props.children}
      </Link>
    );
  }
}

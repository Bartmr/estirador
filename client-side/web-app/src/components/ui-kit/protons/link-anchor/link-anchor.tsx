import { Link } from 'gatsby';
import React, { ReactNode } from 'react';
import { useAppNavigation } from 'src/logic/app-internals/app-navigation/use-app-navigation';
import { AccessibleOnClickPropsHandler } from '../../core/accessibility/make-accessible-on-click-props';
import { makeAccessibleOnClickProps } from '../../core/accessibility/make-accessible-on-click-props';

type Props = {
  children: ReactNode;
  href: string;
  className?: string;
  activeClassName?: string;
  onClick?: AccessibleOnClickPropsHandler<HTMLAnchorElement>;
  style?: React.CSSProperties;
};

export function LinkAnchor(props: Props) {
  const { pathPrefix } = useAppNavigation();

  const commonProps = {
    className: props.className,
    style: props.style,
    ...(props.onClick
      ? makeAccessibleOnClickProps(props.onClick, 'button')
      : {}),
  };

  if (props.href.includes('://')) {
    return (
      <a
        rel="noopener noreferrer"
        href={props.href}
        target="_blank"
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
      <a href={pathPrefix + props.href} {...commonProps}>
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

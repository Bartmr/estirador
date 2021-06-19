import { ReactNode } from 'react';
import {
  AcceptedRoles,
  AccessibleOnClickPropsHandler,
} from '../../core/accessibility/make-accessible-on-click-props';
import { makeAccessibleOnClickProps } from '../../core/accessibility/make-accessible-on-click-props';
import { LinkAnchor } from '../../protons/link-anchor/link-anchor';

export enum ButtonPriority {
  Default = 'btn btn-light',
  Link = 'btn btn-link',
  Primary = 'btn btn-primary',
}

export enum ButtonType {
  Submit = 'submit',
  Reset = 'reset',
}

type Props = {
  priority?: ButtonPriority;
  className?: string;
  icon?: ReactNode;
  label: string;
  disabled?: boolean;
  type?: ButtonType;
  href?: string;
  onClick?: AccessibleOnClickPropsHandler<HTMLElement>;
  loading?: boolean;
  loadingWithoutDisabling?: boolean;
  role?: AcceptedRoles;
};

export function Button(props: Props) {
  const buttonClass = props.priority || ButtonPriority.Default;

  const iconElement = props.icon ? (
    <span className="mr-2">{props.icon}</span>
  ) : null;

  const disabled = props.loading || props.disabled;
  const loading = props.loading || props.loadingWithoutDisabling;
  const pointerClassName =
    (props.disabled ? 'cursor-not-allowed' : undefined) ||
    (props.loading ? 'cursor-wait' : undefined);

  const className = `${buttonClass} ${props.className || ''} ${
    disabled ? 'disabled' : ''
  } ${pointerClassName || ''}`;

  const buttonContents = (
    <>
      {loading ? (
        <span
          style={{ verticalAlign: 'middle' }}
          className="spinner-border spinner-border-sm mr-2"
          role="status"
          aria-hidden="true"
        ></span>
      ) : (
        iconElement
      )}
      {props.label}
    </>
  );

  if (props.href) {
    const propsBase = {
      children: buttonContents,
      onClick: props.onClick,
      className,
      'aria-disabled': disabled ? 'true' : 'false',
    } as const;

    return disabled ? (
      <span {...propsBase} />
    ) : (
      <LinkAnchor {...propsBase} href={props.href} />
    );
  } else if (props.onClick || props.type) {
    const onClickProps = props.onClick
      ? makeAccessibleOnClickProps(props.onClick, props.role || 'button')
      : {};

    return (
      <button
        disabled={disabled}
        type={props.type}
        {...onClickProps}
        className={className}
      >
        {buttonContents}
      </button>
    );
  } else {
    return <div className={`${className} disabled`}>{buttonContents}</div>;
  }
}

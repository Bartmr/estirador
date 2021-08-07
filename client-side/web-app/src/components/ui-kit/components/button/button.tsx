import { ReactNode, SyntheticEvent } from 'react';
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
  onClick?: (e: SyntheticEvent<HTMLElement>) => void;
  loading?: boolean;
  loadingWithoutDisabling?: boolean;
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
    return (
      <button
        disabled={disabled}
        type={props.type || 'button'}
        onClick={(e) => {
          if (props.onClick) {
            props.onClick(e);
          }
        }}
        onKeyUp={(e) => {
          if (e.code === 'Enter' && props.onClick) {
            props.onClick(e);
          }
        }}
        className={className}
      >
        {buttonContents}
      </button>
    );
  } else {
    return <div className={`${className} disabled`}>{buttonContents}</div>;
  }
}

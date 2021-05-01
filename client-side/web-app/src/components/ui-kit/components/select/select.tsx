import React, { ChangeEvent } from 'react';

type Option = {
  value: string;
  label: string;
};

type Props = {
  id?: string;
  className?: string;
  placeholder?: string;
  options: Option[];
} & (
  | {
      onChange: (ev: ChangeEvent<HTMLSelectElement>) => void;
      value: undefined | string;
    }
  | {
      value?: undefined;
      onChange?: undefined;
    }
);

export const Select = React.forwardRef<HTMLSelectElement, Props>(
  (props, ref) => {
    return (
      <select
        ref={ref}
        id={props.id}
        className={`custom-select ${props.className || ''}`}
        value={
          props.value === undefined
            ? props.onChange
              ? ''
              : undefined
            : props.value
        }
        placeholder={props.placeholder}
        onChange={props.onChange}
      >
        {props.value === undefined ? (
          <option
            disabled
            value={props.onChange ? '' : undefined}
            selected={props.onChange ? undefined : true}
          >
            {props.placeholder}
          </option>
        ) : null}
        {props.options.map((option) => {
          return (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          );
        })}
      </select>
    );
  },
);

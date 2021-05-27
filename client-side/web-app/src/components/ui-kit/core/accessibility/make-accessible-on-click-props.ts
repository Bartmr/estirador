import React from 'react';
import { SyntheticEvent } from 'react';

export type AccessibleOnClickPropsHandler<
  Element extends HTMLElement = HTMLElement,
> = (event: SyntheticEvent<Element>) => void;

export type AcceptedRoles = 'button' | 'switch';

export const ROLES_ACCEPTED_KEYBOARD_CODES: {
  [K in AcceptedRoles]: string[];
} = {
  button: ['Enter'],
  switch: ['Space'],
};

export function makeAccessibleOnClickProps<
  Element extends HTMLElement = HTMLElement,
>(
  handler: AccessibleOnClickPropsHandler<Element>,
  role: AcceptedRoles,
  acceptedKeyboardCodes?: string[],
) {
  return {
    onClick: (e: React.MouseEvent<Element, MouseEvent>) => {
      return handler(e);
    },
    onKeyUp: (e: React.KeyboardEvent<Element>) => {
      const _acceptedKeyboardCodes =
        acceptedKeyboardCodes ?? ROLES_ACCEPTED_KEYBOARD_CODES[role];

      if (_acceptedKeyboardCodes.includes(e.code)) {
        return handler(e);
      }
    },
    role,
  };
}

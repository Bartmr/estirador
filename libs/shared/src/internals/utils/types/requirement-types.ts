import { OmitWithTypesafeKeys } from './omission-types';

export type RequiredExcept<T, Exceptions extends keyof T> = Required<
  OmitWithTypesafeKeys<T, Exceptions>
> &
  Pick<T, Exceptions>;

export type RequiredFields<
  T,
  RequiredFieldKeys extends keyof T,
> = OmitWithTypesafeKeys<T, RequiredFieldKeys> &
  Required<
    {
      [RK in RequiredFieldKeys]: T[RK];
    }
  >;

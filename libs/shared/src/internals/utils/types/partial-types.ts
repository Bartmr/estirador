import { OmitWithTypesafeKeys } from './omission-types';

export type PartialExcept<T, Exceptions extends keyof T> = Partial<
  OmitWithTypesafeKeys<T, Exceptions>
> &
  Pick<T, Exceptions>;

export type PartialFields<
  T,
  PartialFieldKeys extends keyof T,
> = OmitWithTypesafeKeys<T, PartialFieldKeys> &
  Partial<{
    [PK in PartialFieldKeys]: T[PK];
  }>;

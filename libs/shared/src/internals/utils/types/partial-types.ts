export type PartialExcept<T, Exceptions extends keyof T> = Partial<
  Omit<T, Exceptions>
> &
  Pick<T, Exceptions>;

export type PartialFields<T, PartialFieldKeys extends keyof T> = Omit<
  T,
  PartialFieldKeys
> &
  Partial<{
    [PK in PartialFieldKeys]: T[PK];
  }>;

export type PartialExcept<T, Exceptions extends keyof T> = Partial<
  Omit<T, Exceptions>
> & {
  [K in Exceptions]: T[K];
};

export type PartialFields<T, Keys extends keyof T> = Omit<T, Keys> &
  Partial<{
    [K in Keys]: T[K];
  }>;

export type RequiredExcept<T, Exceptions extends keyof T> = Required<
  Omit<T, Exceptions>
> & {
  [K in Exceptions]: T[K];
};

export type RequiredFields<T, Keys extends keyof T> = Omit<T, Keys> &
  Required<{
    [K in Keys]: T[K];
  }>;

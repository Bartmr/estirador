export type RequiredExcept<T, Exceptions extends keyof T> = Required<
  Omit<T, Exceptions>
> & {
  [K in Exceptions]: T[K];
};

export type RequiredFields<T, RequiredFieldKeys extends keyof T> = Omit<
  T,
  RequiredFieldKeys
> &
  Required<{
    [RK in RequiredFieldKeys]: T[RK];
  }>;

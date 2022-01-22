export type NonNullableExcept<T, Exceptions extends keyof T> = {
  [K in Exclude<keyof T, Exceptions>]-?: NonNullable<T[K]>;
} & {
  [K in Exceptions]: T[K];
};

export type NonNullableFields<T, Keys extends keyof T> = Omit<T, Keys> & {
  [K in Keys]-?: NonNullable<T[K]>;
};

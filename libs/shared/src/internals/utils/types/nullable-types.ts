export type NonNullableExcept<T, Exceptions extends keyof T> = {
  [NNK in Exclude<keyof T, Exceptions>]-?: NonNullable<T[NNK]>;
} & Pick<T, Exceptions>;

export type NonNullableFields<T, NonNullableFieldKeys extends keyof T> = Omit<
  T,
  NonNullableFieldKeys
> & {
  [NNK in NonNullableFieldKeys]-?: NonNullable<T[NNK]>;
};

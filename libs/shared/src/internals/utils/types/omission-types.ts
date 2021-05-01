export type OmitWithTypesafeKeys<T, K extends keyof T> = Omit<T, K>;

export type OmitWithUndefined<T, K extends keyof T> = OmitWithTypesafeKeys<
  T,
  K
> &
  {
    [NNK in K]?: undefined;
  };

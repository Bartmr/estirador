export type OmitWithTypesafeKeys<T, Keys extends keyof T> = Omit<T, Keys>;

export type OmitWithUndefined<T, Keys extends keyof T> = Omit<T, Keys> & {
  [K in Keys]?: undefined;
};

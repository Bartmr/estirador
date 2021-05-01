export type ReplaceInObject<
  Original,
  Replacement extends { [K in keyof Original]?: unknown }
> = Omit<Original, keyof Replacement> & Replacement;

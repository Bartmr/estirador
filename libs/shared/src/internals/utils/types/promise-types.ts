export type UnwrapPromise<T extends Promise<unknown>> = T extends Promise<
  infer U
>
  ? U
  : unknown;

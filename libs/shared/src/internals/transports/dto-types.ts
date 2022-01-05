export type ToIndexedType<T> = T extends Array<unknown>
  ? Array<ToIndexedType<T[number]>>
  : T extends {}
  ? {
      [K in keyof T]: ToIndexedType<T[K]>;
    }
  : T;

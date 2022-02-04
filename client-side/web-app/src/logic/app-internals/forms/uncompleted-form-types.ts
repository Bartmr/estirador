export type UncompletedFormValue<T> = T extends undefined | null
  ? T
  : T extends Array<unknown>
  ? Array<UncompletedFormValue<T[number]> | undefined>
  : T extends { [key: string]: unknown }
  ? { [K in keyof T]?: UncompletedFormValue<T[K]> }
  : T | undefined | null | string;

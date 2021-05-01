import { SerializableJSONValue } from './json-types';

type ToJSONValue<T extends SerializableJSONValue> = T extends Date ? string : T;

type ToJSONArray<T> = Array<T extends undefined ? null : ToJSON<T>>;

type ToJSONObject<T extends {}> = {
  [K in keyof T]: ToJSON<T[K]>;
};

export type ToJSON<T> = T extends SerializableJSONValue
  ? ToJSONValue<T>
  : T extends Array<unknown>
  ? ToJSONArray<T[number]>
  : T extends {}
  ? ToJSONObject<T>
  : T extends undefined
  ? undefined
  : never;

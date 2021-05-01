import { SerializableJSONValue } from './json-types';

type ToSerializableJSONValue<T extends SerializableJSONValue> = T;

type ToSerializableJSONArray<T> = Array<ToSerializableJSON<T>>;

type ToSerializableJSONObject<T extends {}> = {
  [K in keyof T]: ToSerializableJSON<T[K]>;
};

export type ToSerializableJSON<T> = T extends SerializableJSONValue
  ? ToSerializableJSONValue<T>
  : T extends Array<unknown>
  ? ToSerializableJSONArray<T[number]>
  : T extends {}
  ? ToSerializableJSONObject<T>
  : T extends undefined
  ? undefined
  : never;

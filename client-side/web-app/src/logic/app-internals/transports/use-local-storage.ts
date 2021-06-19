import { InferType, Schema } from 'not-me/lib/schemas/schema';
import { SerializableJSONData, JSONData } from './json-types';

class LocalStorage {
  getItem<S extends Schema<JSONData | undefined>>(
    schema: S,
    key: string,
  ): InferType<S> {
    const data = window.localStorage.getItem(key);

    const validationResult = schema.validate(
      data ? JSON.parse(data) : undefined,
    );

    if (validationResult.errors) {
      throw new Error();
    } else {
      return validationResult.value;
    }
  }

  saveItem<T extends SerializableJSONData>(key: string, value: T): void {
    window.localStorage.setItem(key, JSON.stringify(value));
  }

  wipeAll(): void {
    window.localStorage.clear();
  }
}

export function useLocalStorage() {
  return new LocalStorage();
}

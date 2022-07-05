import { InferType, Schema } from 'not-me/lib/schemas/schema';
import { SerializableJSONData } from './json-types';

class LocalStorage {
  getItem<S extends Schema<SerializableJSONData | undefined>>(
    schema: S,
    key: string,
  ): InferType<S> {
    const data = window.localStorage.getItem(key);

    const validationResult = schema.validate(
      data ? JSON.parse(data) : undefined,
    );

    if (validationResult.errors) {
      throw new Error(
        JSON.stringify(validationResult.messagesTree, undefined, 2),
      );
    } else {
      return validationResult.value;
    }
  }

  setItem<T extends SerializableJSONData>(key: string, value: T): void {
    window.localStorage.setItem(key, JSON.stringify(value));
  }

  wipeAll(): void {
    window.localStorage.clear();
  }
}

export function useLocalStorage() {
  return new LocalStorage();
}

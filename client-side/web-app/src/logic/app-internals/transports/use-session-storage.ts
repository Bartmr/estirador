import { InferType, Schema } from 'not-me/lib/schemas/schema';
import { SerializableJSONData, JSONData } from './json-types';

class SessionStorage {
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

  setItem(key: string, value: SerializableJSONData): void {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  }

  wipeAll(): void {
    window.sessionStorage.clear();
  }
}

export function useSessionStorage() {
  return new SessionStorage();
}

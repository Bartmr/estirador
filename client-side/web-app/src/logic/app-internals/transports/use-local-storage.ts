import { SerializableJSONData, JSONData } from './json-types';

class LocalStorage {
  getItem<T extends JSONData>(key: string): T | undefined {
    const data = window.localStorage.getItem(key);

    return data ? (JSON.parse(data) as T) : undefined;
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

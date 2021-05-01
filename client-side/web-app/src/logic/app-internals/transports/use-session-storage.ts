import { JSONData, SerializableJSONData } from './json-types';

class SessionStorage {
  getItem<T extends JSONData>(key: string): T | undefined {
    const data = window.sessionStorage.getItem(key);

    return data ? (JSON.parse(data) as T) : undefined;
  }

  saveItem(key: string, value: SerializableJSONData): void {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  }

  wipeAll(): void {
    window.sessionStorage.clear();
  }
}

export function useSessionStorage() {
  return new SessionStorage();
}

// Simple storage adapter that works in browser (localStorage) and in tests (in-memory fallback)
type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

type StorageBackend = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

const memoryStore = new Map<string, string>();

function getBackend(): StorageBackend {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return {
    getItem: (key: string) => memoryStore.get(key) ?? null,
    setItem: (key: string, value: string) => {
      memoryStore.set(key, value);
    }
  } as StorageBackend;
}

function readJson<T extends JsonValue>(key: string, fallback: T): T {
  const backend = getBackend();
  try {
    const raw = backend.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (e) {
    return fallback;
  }
}

function writeJson<T extends JsonValue>(key: string, value: T): void {
  const backend = getBackend();
  backend.setItem(key, JSON.stringify(value));
}

export function readSet(key: string): Set<string> {
  const arr = readJson<string[]>(key, []);
  return new Set(arr);
}

export function writeSet(key: string, set: Set<string>): void {
  writeJson(key, Array.from(set));
}

export function appendToSet(key: string, values: string[], maxSize: number): Set<string> {
  const current = readSet(key);
  values.forEach(v => current.add(v));
  // Trim oldest if over maxSize by converting to array; for deterministic trimming, keep insertion order from Array
  if (current.size > maxSize) {
    const trimmed = Array.from(current).slice(current.size - maxSize);
    const trimmedSet = new Set(trimmed);
    writeSet(key, trimmedSet);
    return trimmedSet;
  }
  writeSet(key, current);
  return current;
}

export function clearKey(key: string): void {
  writeJson(key, []);
}

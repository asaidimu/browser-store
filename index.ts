type StorageCallback<T> = (current: T | null, previous?: T | null) => void;

interface StorageListener<T> {
  key: keyof T;
  callback: StorageCallback<T[keyof T]>;
}

declare global {
  interface LocalStore<T extends Record<string, unknown>> {
    update: <K extends keyof T>(key: K, value: Partial<T[K]>) => void;
    set: <K extends keyof T>(key: K, value: T[K]) => void;
    get: <K extends keyof T>(key: K) => T[K] | null;
    clear: <K extends keyof T>(key: K) => void;
    onChange: <K extends keyof T>(
      key: K,
      callback: StorageCallback<T[K]>
    ) => () => void;
    clearAll: () => void;
  }
}

function createLocalStore<T extends Record<string, unknown>>({
  storage = window.localStorage,
  prefix = '',
}: {
  storage?: Storage;
  prefix?: string;
} = {}): LocalStore<T> {
  const listeners: StorageListener<T>[] = [];

  // Helper to get prefixed key
  const getKey = (key: keyof T): string => `${prefix}${String(key)}`;

  // Helper to notify listeners
  const notifyListeners = <K extends keyof T>(
    key: K,
    newValue: T[K] | null,
    oldValue?: T[K] | null
  ): void => {
    listeners
      .filter((listener) => listener.key === key)
      .forEach((listener) => listener.callback(newValue, oldValue));
  };

  // Helper to safely parse JSON
  const safeJSONParse = (value: string | null): unknown | null => {
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  };

  return {
    set<K extends keyof T>(key: K, value: T[K]): void {
      const storageKey = getKey(key);
      const oldValue = this.get(key);

      try {
        storage.setItem(storageKey, JSON.stringify(value));
        notifyListeners(key, value, oldValue);
      } catch (error) {
        if (error instanceof Error) {
          // Handle storage quota exceeded
          if (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
            console.error('Storage quota exceeded:', error);
            // Optionally implement cleanup strategy here
          } else {
            throw error;
          }
        }
      }
    },

    update<K extends keyof T>(key: K, value: Partial<T[K]>): void {
      const oldValue = this.get(key);
      const newValue = {
        ...(oldValue as Record<string, unknown>),
        ...(value as Record<string, unknown>),
      } as T[K];

      this.set(key, newValue);
    },

    get<K extends keyof T>(key: K): T[K] | null {
      const storageKey = getKey(key);
      const value = storage.getItem(storageKey);
      return safeJSONParse(value) as T[K] | null;
    },

    clear<K extends keyof T>(key: K): void {
      const storageKey = getKey(key);
      const oldValue = this.get(key);
      storage.removeItem(storageKey);
      notifyListeners(key, null, oldValue);
    },

    clearAll(): void {
      if (prefix) {
        const keys = Object.keys(storage);
        keys.forEach(key => {
          if (key.startsWith(prefix)) {
            storage.removeItem(key);
          }
        });
      } else {
        storage.clear();
      }
    },

    onChange<K extends keyof T>(
      key: K,
      callback: StorageCallback<T[K]>
    ): () => void {
        // TODO: If it broke, check this line ....
      const listener: StorageListener<T> = { key, callback:callback as any };
      listeners.push(listener);

      const handleStorageEvent = (event: StorageEvent): void => {
        if (event.key === getKey(key)) {
          const newValue = safeJSONParse(event.newValue) as T[K] | null;
          const oldValue = safeJSONParse(event.oldValue) as T[K] | null;
          callback(newValue, oldValue);
        }
      };

      window.addEventListener('storage', handleStorageEvent);

      return () => {
        const index = listeners.indexOf(listener);
        if (index > -1) {
          listeners.splice(index, 1);
        }
        window.removeEventListener('storage', handleStorageEvent);
      };
    },
  };
}

export default createLocalStore;

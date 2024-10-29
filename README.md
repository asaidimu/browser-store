# @asaidimu/browser-store
## TypeScript Local Storage Manager

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?logo=typescript)](https://www.typescriptlang.org/)

A type-safe, robust wrapper around browser's Storage API with cross-tab synchronization support. Built with TypeScript for maximum type safety and developer experience.

## ✨ Features

- 🔒 **Type-safe**: Full TypeScript support with precise type inference
- 🔄 **Cross-tab synchronization**: Real-time updates across browser tabs
- 🎯 **Namespacing**: Prefix support to avoid key collisions
- 🧹 **Memory efficient**: Automatic cleanup of event listeners
- 🛡️ **Error handling**: Graceful handling of storage quota and parsing errors
- 💪 **Flexible**: Works with both localStorage and sessionStorage

## 📦 Installation

```bash
npm install @asaidimu/browser-store
# or
yarn add @asaidimu/browser-store
# or
pnpm add @asaidimu/browser-store
```

## 🚀 Quick Start

```typescript
import createLocalStore from '@asaidimu/browser-store';

// Define your store structure
interface MyStore {
  user: {
    name: string;
    age: number;
  };
  settings: {
    theme: 'light' | 'dark';
    notifications: boolean;
  };
}

// Create a store instance
const store = createLocalStore<MyStore>({
  prefix: 'myApp:', // Optional prefix for all keys
});

// Set values
store.set('user', { 
  name: 'John Doe', 
  age: 30 
});

// Partial updates
store.update('user', { 
  age: 31  // Only updates age, preserves name
});

// Get values
const user = store.get('user');
console.log(user?.name); // "John Doe"

// Listen for changes (including from other tabs)
const cleanup = store.onChange('settings', (current, previous) => {
  console.log('Settings changed:', { current, previous });
});

// Remove specific key
store.clear('user');

// Clear all data with prefix
store.clearAll();

// Clean up listeners when done
cleanup();
```

## 📖 API Reference

### `createLocalStore<T>(options?: StoreOptions): LocalStore<T>`

Creates a new store instance.

#### Options

```typescript
interface StoreOptions {
  storage?: Storage;        // defaults to localStorage
  prefix?: string;         // namespace prefix for keys
}
```

#### Methods

- **`set<K>(key: K, value: T[K]): void`**  
  Sets a value for a key, replacing any existing value.

- **`update<K>(key: K, value: Partial<T[K]>): void`**  
  Partially updates an existing value, preserving unspecified fields.

- **`get<K>(key: K): T[K] | null`**  
  Retrieves a value by key. Returns null if not found.

- **`clear<K>(key: K): void`**  
  Removes a specific key and its value.

- **`clearAll(): void`**  
  Removes all values with the store's prefix.

- **`onChange<K>(key: K, callback: (current: T[K] | null, previous?: T[K] | null) => void): () => void`**  
  Subscribes to changes for a specific key. Returns a cleanup function.

## 🔥 Advanced Usage

### Cross-Tab Communication

```typescript
// Tab 1
const store = createLocalStore<MyStore>({ prefix: 'myApp:' });
store.onChange('settings', (current) => {
  console.log('Settings updated in another tab:', current);
});

// Tab 2
const store2 = createLocalStore<MyStore>({ prefix: 'myApp:' });
store2.set('settings', { theme: 'dark', notifications: true });
// Tab 1 will log the new settings
```

### Using with SessionStorage

```typescript
const sessionStore = createLocalStore<MyStore>({
  storage: window.sessionStorage,
  prefix: 'myApp:',
});
```

### Type-Safe Partial Updates

```typescript
interface User {
  name: string;
  age: number;
  preferences: {
    newsletter: boolean;
    theme: string;
  };
}

interface MyStore {
  user: User;
}

const store = createLocalStore<MyStore>();

// This will error if fields don't match User type
store.update('user', {
  age: 32,
  preferences: {
    newsletter: true,
  },
});
```

## ⚠️ Error Handling

The library handles common errors gracefully:

- Storage quota exceeded
- JSON parsing errors
- Invalid data types
- Missing keys

```typescript
try {
  store.set('user', { /* large data */ });
} catch (error) {
  if (error instanceof Error) {
    console.error('Storage operation failed:', error.message);
  }
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

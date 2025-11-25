# pinia-class-transformer
Transform your classes to Pinia stores

## Installation

```bash
npm install pinia-class-transformer
# or
yarn add pinia-class-transformer
# or
pnpm add pinia-class-transformer
# or
bun add pinia-class-transformer
```

## Usage
You can use `defineOptionStore()` or `defineSetupStore()` to define a store. They have identical type intellisense. The major difference is how they convert your class to a pinia store.

### Basic example
```typescript
class MyStore {
    count = 1
    get double() { return this.count * 2 }
    increment() { this.count++ }
}

const useMyStore = defineOptionStore(MyStore)
// or
const useMyStore = defineSetupStore(MyStore)
```

`defineOptionStore()` is the recommended, stable way to convert your class. It maps your class directly to a Pinia Options Store. It is lightweight and covers most use cases.

`defineSetupStore()` offers more flexibility, allowing the use of Composables and complex setup logic. It scans your class, creates ref and computed, binds computed to a reactive proxy, runs your custom `setup()` function, and assembles everything into a Setup Store. **Note that this might have minor compatibility differences with some Pinia plugins compared to the `defineOptionStore()`.**

### Using composables in `setup()`
*NOTE: This feature is only available in `defineSetupStore()`*

If you need to run some custom logic involving **Composables** (e.g. `watch`, `watchEffect`) after initialization of states and getters, use `defineSetupStore()` and define a `setup()` function in your class.

The return value of `setup()` will be merged into the store.

**NOTE**: While you can override class members in `setup()`, it is not recommended. For type intellisense, the library only handles overrides that match the original member's type. Overriding a Ref with a ComputedRef may break type inference and you might have to handle it yourself.

```typescript
class MyStore {
    count = 1
    increment() { this.count++ }

    setup() {
        const double = computed(() => this.count * 2)
        return { double }
    }
}

const useMyStore = defineSetupStore(MyStore)
```

### Inheritance
Store classes can inherit from other classes.

```typescript
class BaseStore {
    count = 1
    increment() { this.count++ }
}

class MyStore extends BaseStore {
    get double() { return this.count * 2 }
}

const useMyStore = defineOptionStore(MyStore)
// or
const useMyStore = defineSetupStore(MyStore)
```

### Accessing Pinia's properties
You can use helper functions to access Pinia's properties and plugin-injected properties in your class.

#### In Actions
Use `useContext()` to access the full Store instance, including `$patch`, `$reset`, `$state`, and plugin-injected properties.

```typescript
import { useContext } from 'pinia-class-transformer';

class MyStore {
    count = 1;
    
    reset() {
        useContext(this).$reset();
    }
    
    update() {
        useContext(this).$patch({ count: 10 });
    }
}
```

#### In Getters
Use `useGetterContext(this)` to access **only** plugin-injected properties

```typescript
import { useGetterContext } from 'pinia-class-transformer';

class MyStore {
    get isLoading() {
        // Refer to: Fuphoenixes/piniaPluginLoading
        return this.$loading.fetchData
    }

    async fetchData() { /* ... */ }
}
```

## TODO
- passing extra options to `defineStore()`

## License
MIT

## References
[vuex-smart-module](https://github.com/ktsn/vuex-smart-module)

[pinia-decorator](https://github.com/Haixing-Hu/pinia-decorator)

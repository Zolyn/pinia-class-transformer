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
  count = 1;
  get double() {
    return this.count * 2;
  }
  increment() {
    this.count++;
  }
}

const useMyStore = defineOptionStore(MyStore);
// or
const useMyStore = defineSetupStore(MyStore);
```

`defineOptionStore()` is the recommended, stable way to convert your class. It maps your class directly to a Pinia Options Store. It is lightweight and covers most use cases.

`defineSetupStore()` offers more flexibility but might have minor compatibility differences with some Pinia plugins compared to the `defineOptionStore()`.

### Using composables in `setup()`

You can define a `setup()` function in your class if you need to run some custom logic involving **Composables** (e.g. `watch`, `watchEffect`) after initialization of states and getters.

For `defineSetupStore()`, the return value of `setup()` will be merged into the store.

**NOTE**:

1. While you can override class members in `setup()` when using `defineSetupStore()`, it is not recommended. For type intellisense, the library only handles overrides that match the original member's type. Overriding a Ref with a ComputedRef may break type inference and you might have to handle it yourself.
2. Calling actions in `setup()` in `defineSetupStore()` will no trigger Pinia's `$onAction` because the actions are pre-assigned to the store and not wrapped.

```typescript
class MyStore {
  count = 1;
  increment() {
    this.count++;
  }

  setup() {
    const double = computed(() => this.count * 2);
    return { double };
  }
}

const useMyStore = defineSetupStore(MyStore);
```

### Inheritance

Store classes can inherit from other classes.

```typescript
class BaseStore {
  count = 1;
  increment() {
    this.count++;
  }
}

class MyStore extends BaseStore {
  get double() {
    return this.count * 2;
  }
}

const useMyStore = defineOptionStore(MyStore);
// or
const useMyStore = defineSetupStore(MyStore);
```

### Accessing Pinia's properties

You can use helper functions to access Pinia's properties and plugin-injected properties in your class.

**NOTE**: If you encounter type errors, try manually passing the Store type to the helper functions.

#### In Actions

Use `useContext()` to access the full Store instance, including `$patch`, `$reset`, `$state`, and plugin-injected properties.

```typescript
import { useContext } from "pinia-class-transformer";

class MyStore {
  count = 1;

  reset() {
    useContext(this).$reset();
  }

  update() {
    useContext<Store>(this).$patch({ count: 10 });
  }
}
```

#### In Getters

Use `useGetterContext(this)` to access **only** plugin-injected properties

```typescript
import { useGetterContext } from "pinia-class-transformer";

class MyStore {
  get isLoading(): boolean {
    // Refer to: Fuphoenixes/piniaPluginLoading
    return useGetterContext<Store>(this).$loading.fetchData;
  }

  async fetchData() {
    /* ... */
  }
}
```

**NOTE**: If you return the value accessed from `useGetterContext()`, you need to explicitly mark the return type.

## Which one should I use?

This table might help you make a decision.

| Feature                    | `defineOptionStore`                      | `defineSetupStore`                                                                  |
| :------------------------- | :--------------------------------------- | :---------------------------------------------------------------------------------- |
| **Underlying Pinia API**   | Options API (`defineStore(id, { ... })`) | Setup API (`defineStore(id, () => { ... })`)                                        |
| **`setup()` return value** | Ignored. Use for side effects only.      | Merged into the store. Can add new state/getters/actions or override existing ones. |
| **Writable Computed**      | Not supported                            | Supported                                                                           |
| **`$reset()`**             | Supported                                | Not supported (You need to implement it manually)                                   |
| **Best for...**            | Simple stores, needing `$reset()`        | Complex logic, heavy use of Composables, needing writable computed properties       |

## Future Improvements

- Inject fake context using `Symbol` for type intellisense
- Call `action` wrapper when pre-assigning actions
- passing extra options to `defineStore()`

## License

MIT

## References

[vuex-smart-module](https://github.com/ktsn/vuex-smart-module)

[pinia-decorator](https://github.com/Haixing-Hu/pinia-decorator)

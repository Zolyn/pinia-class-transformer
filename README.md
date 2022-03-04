# pinia-class-transformer

Transform classes to a Pinia store.

## Installation

```bash
# ni (Recommended)
ni -D pinia-class-transformer

# npm
npm install -D pinia-class-transformer

# yarn
yarn add -D pinia-class-transformer

# pnpm
pnpm add -D pinia-class-transformer
```

## Usage

There are two ways to define a store by using classes.

-   [State + StoreFragment](#state--storefragment) (Recommended)
-   [Store](#store)

### State + StoreFragment

```typescript
import { defineStore } from 'pinia';
import { StoreFragment, transformClass } from 'pinia-class-transformer';

class State {
    counter = 0;
}

class Fragment extends StoreFragment<State, Fragment> {
    get doubleCount(): number {
        return this.state.counter * 2;
    }

    get doubleCountPlusOne(): number {
        // return this.doubleCount + 1;
        return this.state.counter * 2 + 1;
    }

    reset(): void {
        this.state.counter = 0;
    }
}

const useMainStore = defineStore('main', transformClass(State, Fragment));

export default useMainStore;
```

### Store

Similar to v1

```typescript
import { defineStore } from 'pinia';
import { transformClass } from 'pinia-class-transformer';

class Store {
    counter = 0;

    get doubleCount(): number {
        return this.counter * 2;
    }

    get doubleCountPlusOne(): number {
        // return this.doubleCount + 1;
        return this.counter * 2 + 1;
    }

    reset(): void {
        this.counter = 0;
    }
}

const useMainStore = defineStore('main', transformClass(Store));

export default useMainStore;
```

Though it looks a little more convenient than the other way, it has some Cons.

### Setup function

You can use Composition APIs like `watch` and `watchEffect` to monitor the store in an Action called `setup`.

In some ways, it is similar to setup stores.

You can use this feature no matter you use which kinds of way to define the Store.

**NOTE**: The return value of setup function will be ignored because I cannot find its use case.
You can open an issue or a discussion if you have any suggestions for that.

```typescript
import { watchEffect } from 'vue';
import { defineStore } from 'pinia';
import { StoreFragment, transformClass } from 'pinia-class-transformer';

class State {
    counter = 0;
}

class Fragment extends StoreFragment<State, Fragment> {
    get doubleCount(): number {
        return this.state.counter * 2;
    }

    get doubleCountPlusOne(): number {
        // return this.doubleCount + 1;
        return this.state.counter * 2 + 1;
    }

    reset(): void {
        this.state.counter = 0;
    }

    setup(): void {
        watchEffect(() => console.log(`count: ${this.state.count}`));
    }
}

const useMainStore = defineStore('main', transformClass(State, Fragment));

export default useMainStore;
```

You will not get its type due to its particularity.

```typescript
[...]

const store = useMainStore();
// Typescript error: TS2339: Property 'setup' does not exist on type ...
store.setup();
```

### Accessing wrapped store

WIP...

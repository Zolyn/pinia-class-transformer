# pinia-store-decorators

Typescript Decorators to define Pinia stores.

## Installation

```shell
# npm
npm install -D pinia-store-decorators

# yarn
yarn add -D pinia-store-decorators

# pnpm
pnpm add -D pinia-store-decorators
```

## Usage

### Defining a Store

```typescript
import { defineStore } from 'pinia';
import { Store, createOptions } from 'pinia-store-decorators';

@Store
class MainStore {
    public counter = 0;

    public name = 'Eduardo';

    public get doubleCount(): number {
        return this.counter * 2;
    }

    public get doubleCountPlusOne(): number {
        return this.counter * 2 + 1;
    }

    public reset(): void {
        this.counter = 0;
    }
}

export const useMainStore = defineStore(createOptions('main', MainStore));
```

Equivalent to the code below

```typescript
import { defineStore } from 'pinia';

const mainStore = {
    state: () => ({
        counter: 0,
        name: 'Eduardo',
    }),
    getters: {
        doubleCount(): number {
            return this.counter * 2;
        },
        doubleCountPlusOne(): number {
            return this.counter * 2 + 1;
        },
    },
    actions: {
        reset(): void {
            this.counter = 0;
        },
    },
};

export const useMainStore = defineStore('main', mainStore);
```

WIP...

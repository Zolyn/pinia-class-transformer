# pinia-store-decorators

Typescript Decorators to define Pinia stores.

## Installation

```shell
# npm
npm install pinia-store-decorators

# yarn
yarn add pinia-store-decorators

# pnpm
pnpm add pinia-store-decorators
```

## Usage

### Defining a Store

```typescript
import { defineStore } from 'pinia';
import { Store, Action, getOptions } from 'pinia-store-decorators';

@Store('main')
class MainStore {
    public counter = 0;

    public name = 'Eduardo';

    public get doubleCount(): number {
        return this.counter * 2;
    }

    public get doubleCountPlusOne(): number {
        return this.counter * 2 + 1;
    }

    @Action
    public reset(): void {
        this.counter = 0;
    }
}

export const useMainStore = defineStore(getOptions<'main', MainStore>(MainStore));
```

WIP..

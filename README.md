# pinia-class-transformer

Transform classes to a [Setup Store](https://github.com/vuejs/pinia/issues/978) for Pinia.

**NOTE:** I am trying to improve my English.
If you find any problems with the documentation, PR is welcome :D

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

-   [State + StoreFragment](#use-state--storefragment) (Recommended)
-   [Store](#use-store)

### Use State + StoreFragment

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

### Use Store

Similar to [v1](https://github.com/Zolyn/pinia-class-transformer/tree/v1)

```typescript
import { defineStore } from 'pinia';
import { transformClass } from 'pinia-class-transformer';

class Main {
    counter = 1;

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

const useMainStore = defineStore('main', transformClass(Main));

export default useMainStore;
```

Though it looks a little more convenient than the other way, it has some [Cons](#cons).

### Setup function

In some ways, it is similar to [Setup Stores](https://github.com/vuejs/pinia/issues/978)

You can use Composition APIs like `watch` and `watchEffect` to monitor the store in an Action called `setup`.

This feature can be used in [any](#usage) way you define a store.

**NOTE:** The return value of setup function will be ignored because I cannot find its use case.
You can [open an issue](https://github.com/Zolyn/pinia-class-transformer/issues/new/choose) or [start a discussion](https://github.com/Zolyn/pinia-class-transformer/discussions/new) if you have any suggestions for that.

```typescript
import { watchEffect } from 'vue';
import { defineStore } from 'pinia';
import { StoreFragment, transformClass } from 'pinia-class-transformer';

class State {
    counter = 1;
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
        watchEffect(() => console.log(`count: ${this.state.counter}`));
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

### Accessing Reactive Variable itself

Since the transformation result is a [Setup Store](https://github.com/vuejs/pinia/issues/978) for Pinia, State and Getters are Reactive Variables.
Generally, you don't need to append `.value` to State or Getters to access its value because it is automatically completed by [Proxy](https://github.com/Zolyn/pinia-class-transformer/blob/5de84d4cba3b83a07584a087acc4aec72e744263/src/utils.ts#L11).

However, in some cases, you may want to access the Reactive Variable itself.
You can get the wrapped store (the store without [Proxy](https://github.com/Zolyn/pinia-class-transformer/blob/5de84d4cba3b83a07584a087acc4aec72e744263/src/utils.ts#L11)) through the `wrappedStore` property and access State and Getters in the form of Reactive Variables.

This is an example of using this feature in [StoreFragment](#use-state--storefragment).

```typescript
import { defineStore } from 'pinia';
import { StoreFragment, transformClass } from 'pinia-class-transformer';

class State {
    counter = 0;
}

class Fragment extends StoreFragment<State, Fragment> {
    get doubleCount(): number {
        return this.wrappedStore.counter.value * 2;
    }

    get doubleCountPlusOne(): number {
        // return this.wrappedStore.doubleCount.value + 1;
        return this.wrappedStore.counter.value * 2 + 1;
    }

    reset(): void {
        // this.state.counter = 0;
        this.wrappedStore.counter.value = 0;
    }
}

const useMainStore = defineStore('main', transformClass(State, Fragment));

export default useMainStore;
```

If you want to use this feature in [Store](#use-store), you need to import the `Store` class and extend it.

```typescript
import { defineStore } from 'pinia';
import { transformClass, Store } from 'pinia-class-transformer';

class Main extends Store<Main> {
    counter = 1;

    get doubleCount(): number {
        return this.wrappedStore.counter.value * 2;
    }

    get doubleCountPlusOne(): number {
        // return this.wrappedStore.doubleCount.value + 1;
        return this.wrappedStore.counter.value * 2 + 1;
    }

    reset(): void {
        this.wrappedStore.counter.value = 0;
    }
}

const useMainStore = defineStore('main', transformClass(Main));

export default useMainStore;
```

**NOTE:** You may encounter problems with type hints when you use this feature in Store. See [Cons](#cons)

## Types of project built-in classes

### StoreFragment<S, F>

A class which contains Getters and Actions.

#### Type parameters

| Name | Type             | Description                         |
| :--- | :--------------- | :---------------------------------- |
| `S`  | extends `object` | a State class                       |
| `F`  | extends `object` | a class which extends StoreFragment |

#### Properties

| Modifiers   | Name           | Type                    | Description                                                                                          |
| :---------- | :------------- | :---------------------- | :--------------------------------------------------------------------------------------------------- |
| `protected` | `state`        | `ExcludeFunc<S>`        | Properties that are not functions in the State class                                                 |
| `protected` | `wrappedStore` | `TransformResult<S, F>` | the store without [Proxy](https://github.com/Zolyn/pinia-class-transformer/blob/v2/src/utils.ts#L11) |

### Store\<S>

A class which contains all the stuff.

#### Type parameters

| Name | Type             | Description                   |
| :--- | :--------------- | :---------------------------- |
| `S`  | extends `object` | A class that may extend Store |

#### Properties

| Modifier    | Name           | Type                             | Description                                                                                          |
| :---------- | :------------- | :------------------------------- | :--------------------------------------------------------------------------------------------------- |
| `protected` | `wrappedStore` | `TransformResult<S, Actions<S>>` | the store without [Proxy](https://github.com/Zolyn/pinia-class-transformer/blob/v2/src/utils.ts#L11) |

## Pros

I think it's better to call it "Compare to [Setup Store](https://github.com/vuejs/pinia/issues/978)".

-   You don't need to append `.value` to State or Getters to access its value.
-   You don't need to return the Reactive Variables manually.

## Cons

### StoreFragment & Store

-   All setters will be ignored. Same reason as [setup function](#setup-function). Please [open an issue](https://github.com/Zolyn/pinia-class-transformer/issues/new/choose) or [start a discussion](https://github.com/Zolyn/pinia-class-transformer/discussions/new) if you have any suggestions for it.
-   You will not get type hints if you declare properties with modifiers like `private` and `protected`.

**TIP:** It is recommended to explicitly annotate the return type of Getters and Actions to avoid unexpected type problems.

### Store

-   All Getters are treated as State because I can't find a way to separate the type of State from the type of Getters. Fortunately, they are read-only by default.
    However, they will be writable if you declare setters with the same name, which means you will get wrong type hints.
-   Since all Getters are treated as State, the type of Getters in the form of Reactive Variables is also `Ref<T>`, as same as State.
    To solve this problem, you can use type assertion or import a helper function called `c` to convert the type to `ComputedRef<T>`.

```typescript
import { defineStore } from 'pinia';
import { transformClass, Store, c } from 'pinia-class-transformer';

class Main extends Store<Main> {
    counter = 1;

    // Type: Ref<number> (not converted)
    get doubleCount(): number {
        return this.wrappedStore.counter.value * 2;
    }

    get doubleCountPlusOne(): number {
        // Type: ComputedRef<number> (converted)
        // return (this.wrappedStore.doubleCount as ComputedRef<number>).value + 1;
        return c(this.wrappedStore.doubleCount).value + 1;
    }

    reset(): void {
        this.wrappedStore.counter.value = 0;
    }
}

const useMainStore = defineStore('main', transformClass(Main));

export default useMainStore;
```

**NOTE:** In some IDEs (e.g.: Webstorm), the type of State in the form of Reactive Variables may be incorrectly inferred as `ComputedRef<T>`. You can use type assertion or import a helper function called `r` to explicitly declare the type as `Ref<T>`.

**COMPLAIN:** Unfortunately, the IDE I usually use is Webstorm.
The funniest thing is that I can see the correct type hints from the code completion, however, I get the wrong type hints when I attempt to access and assign the value.
I don't know what caused this problem, it doesn't exist in Vscode.
That's why I added a helper function called `r` :(

<details>
  <summary>Demo</summary>
  <img src="https://cdn.jsdelivr.net/gh/Zolyn/Vita@main/img/Peek%202022-03-05%2015-24.gif" alt="Webstorm" />
  <img src="https://cdn.jsdelivr.net/gh/Zolyn/Vita@main/img/Peek%202022-03-05%2015-26.gif" alt="Vscode" />
</details>

## Performance

Well, this project is originally written for my own use :P. I don't know how much it affects the performance.
If you're going to use it in a production environment, think carefully before using it.

## License

[MIT](https://mit-license.org/)

# pinia-class-transformer

将类转换为 Pinia 的 [Setup Store](https://github.com/vuejs/pinia/issues/978) 。

**注:** 我正在努力提高我的英语水平，如果你在（英文）文档中发现任何问题，欢迎 PR。

## 安装

```bash
# ni (推荐)
ni -D pinia-class-transformer

# npm
npm install -D pinia-class-transformer

# yarn
yarn add -D pinia-class-transformer

# pnpm
pnpm add -D pinia-class-transformer
```

## 用法

一共有两种方式来使用类定义 Store

-   [State + StoreFragment](#-state--storefragment) (推荐)
-   [Store](#-store)

### 使用 State + StoreFragment

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

### 使用 Store

与 [v1](https://github.com/Zolyn/pinia-class-transformer/tree/v1) 的方式相似

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

虽然它看起来比上一个方式要方便一些，但它有一些 [缺点](#storefragment--store)。

### Setup 函数

从某种角度上说，它与 [Setup Stores](https://github.com/vuejs/pinia/issues/978) 相似。

你可以在一个名为 `setup` 的 Action 中使用像 `watch` 和 `watchEffect` 一样的 Composition APIs 来监听 store。

无论你使用 [何种](#-state--storefragment) 方式定义 store，都可以使用这个特性。

**注:** 因为我找不到使用场景，所以 setup 函数的返回值会被忽略。
如果你对此有任何建议，你可以 [新建一个 Issue](https://github.com/Zolyn/pinia-class-transformer/issues/new/choose) 或 [发起一个讨论](https://github.com/Zolyn/pinia-class-transformer/discussions/new) 。

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

因为它的特殊性，你将不会获得它的类型提示。

```typescript
[...]

const store = useMainStore();
// Typescript error: TS2339: Property 'setup' does not exist on type ...
store.setup();
```

### 访问响应式变量本身

因为转换的结果是一个 Pinia 的 [Setup Store](https://github.com/vuejs/pinia/issues/978) ，所以 State 和 Getters 都是响应式变量。
通常情况下, 你并不需要在 State 或 Getters 后追加 `.value` 来访问它的值， 因为这部分将会由 [Proxy](https://github.com/Zolyn/pinia-class-transformer/blob/5de84d4cba3b83a07584a087acc4aec72e744263/src/utils.ts#L11) 自动补全。

然而, 在某些场景下, 你可能想要访问响应式变量本身，而不是它的值。
你可以通过 `wrappedStore` 属性访问 “包装的 store” (没有了 [Proxy](https://github.com/Zolyn/pinia-class-transformer/blob/5de84d4cba3b83a07584a087acc4aec72e744263/src/utils.ts#L11) 的 store) 并在其中访问响应式变量形式的 State 和 Getters。

这是一个在 [StoreFragment](#-state--storefragment) 中使用这个特性的例子。

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

如果你想在 [Store](#-store) 中使用这个特性，你需要导入 `Store` 类并且继承它。

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

**注:** 如果你在 [Store](#-store) 中使用这个特性，你可以会遇到类型提示方面的问题。详情查阅 [缺点](#storefragment--store) 。

## 项目内置类的类型

### StoreFragment<S, F>

一个包含了 Getters 和 Actions 。

#### 类型参数

| 名称 | 类型             | 描述                        |
| :--- | :--------------- | :-------------------------- |
| `S`  | extends `object` | 一个 State 类               |
| `F`  | extends `object` | 一个继承 StoreFragment 的类 |

#### 属性

| 修饰符      | 名称           | 类型                    | 描述                                                                                             |
| :---------- | :------------- | :---------------------- | :----------------------------------------------------------------------------------------------- |
| `protected` | `state`        | `ExcludeFunc<S>`        | State 类中非函数类型的属性                                                                       |
| `protected` | `wrappedStore` | `TransformResult<S, F>` | 没有 [Proxy](https://github.com/Zolyn/pinia-class-transformer/blob/v2/src/utils.ts#L11) 的 store |

### Store\<S>

一个包含所有东西的类。

#### 类型参数

| 名称 | 类型             | 描述                    |
| :--- | :--------------- | :---------------------- |
| `S`  | extends `object` | 一个可能继承 Store 的类 |

#### 属性

| 修饰符      | 名称           | 类型                             | 描述                                                                                             |
| :---------- | :------------- | :------------------------------- | :----------------------------------------------------------------------------------------------- |
| `protected` | `wrappedStore` | `TransformResult<S, Actions<S>>` | 没有 [Proxy](https://github.com/Zolyn/pinia-class-transformer/blob/v2/src/utils.ts#L11) 的 store |

## 优点

我觉得叫它 "和 [Setup Store](https://github.com/vuejs/pinia/issues/978) 对比" 可能更好。

-   你不需要在 State 或 Getters 后追加 `.value` 来访问它的值。
-   你不需要手动返回响应式变量。

## 缺点

### StoreFragment & Store

-   所有的 setters 都会被忽略。和 [setup 函数](#setup-) 的原因相同。请 [新建一个 Issue](https://github.com/Zolyn/pinia-class-transformer/issues/new/choose) 或 [发起一个讨论](https://github.com/Zolyn/pinia-class-transformer/discussions/new) 如果你对它有任何建议。
-   如果你用像 `private` 和 `protected` 的修饰符定义属性，你将不会获得类型提示。

**提示:** 为了避免无法预料的类型问题，推荐显式地标注 Getters 和 Actions 的返回类型。

### Store

-   因为我找不到分离 State 和 Getters 的类型的方法，所有 Getters 会被视作为 State。幸运的是， 它们在默认情况下是只读的。
    然而，如果你定义同名的 setters，它们将会变为可写的，这意味着你会获得错误的类型提示。
-   既然 Getters 被视作为 State，那么响应式变量形式的 Getters 的类型也是 `Ref<T>`，和 State 一样。
    为了解决这个问题， 你可以使用类型断言或导入一个名为 `c` 的 helper 函数来将它的类型转换为 `ComputedRef<T>`。

```typescript
import { defineStore } from 'pinia';
import { transformClass, Store, c } from 'pinia-class-transformer';

class Main extends Store<Main> {
    counter = 1;

    // Type: Ref<number> (未转换)
    get doubleCount(): number {
        return this.wrappedStore.counter.value * 2;
    }

    get doubleCountPlusOne(): number {
        // Type: ComputedRef<number> (已转换)
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

**注:** 在一些 IDE 中 (e.g.: Webstorm)，响应式变量形式的 State 的类型可能会被错误地推导为 `ComputedRef<T>`。你可以使用类型断言或导入一个名为 `r` 的 helper 函数来显式地声明类型为 `Ref<T>`。

**小声 BB:** 不幸的是，我经常使用的 IDE 就是 Webstorm。
最搞笑的事情是，我可以在代码补全提示中看到正确的类型提示，然而，当我尝试访问它的值并赋值给它时，我得到错误的类型提示。
我不知道为什么会有这个问题，在 Vscode 上并没有这个问题。
这就是我要添加一个名为 `r` 的 helper 函数的原因 :(

<details>
  <summary>演示</summary>
  <img src="https://cdn.jsdelivr.net/gh/Zolyn/Vita@main/img/Peek%202022-03-05%2015-24.gif" alt="Webstorm" />
  <img src="https://cdn.jsdelivr.net/gh/Zolyn/Vita@main/img/Peek%202022-03-05%2015-26.gif" alt="Vscode" />
</details>

## 性能

Emmm.....这个项目实际上是写给我自己用的，所以我并不知道它会对性能造成多大的影响（我也不知道怎么测试它的性能）。
如果你要在生产环境中使用它，请自行斟酌。

## 协议

[MIT](https://mit-license.org/)

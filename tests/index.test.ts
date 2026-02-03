import { computed, watchEffect } from "vue";
import { beforeEach, expect, test, describe, vi } from "vitest";
import {
  createPinia,
  getActivePinia,
  Pinia,
  PiniaPlugin,
  setActivePinia,
  StoreGeneric,
} from "pinia";
import { defineOptionStore, defineSetupStore, useContext } from "../src";
import type { SetupStore } from "../src/setupStore";
import type { OptionStore } from "../src/optionStore";
import type { Class } from "type-fest";
import { StateTree } from "../src/types/shared";

beforeEach(() => setActivePinia(createPinia()));

type TestingPinia = Pinia & {
  _p: PiniaPlugin[];
};

function getActiveTestingPinia(): TestingPinia {
  const pinia = getActivePinia() as TestingPinia | undefined;

  if (!pinia) {
    throw new Error("No active pinia found");
  }

  pinia.use = function (plugin: PiniaPlugin) {
    this._p.push(plugin);
    return this;
  };

  return pinia;
}

type SetupStoreFn = <S extends object>(storeClass: Class<S>) => SetupStore<S>;
type OptionStoreFn = <S extends object>(storeClass: Class<S>) => OptionStore<S>;

function createSharedTest(
  testFn: (defineFn: SetupStoreFn | OptionStoreFn) => void
) {
  return () =>
    test.each([
      ["Option", defineOptionStore],
      ["Setup", defineSetupStore],
    ])("%s", (_, defineFn) => {
      testFn(defineFn);
    });
}

function runSharedTest(
  testFn: (defineFn: SetupStoreFn | OptionStoreFn) => void
) {
  createSharedTest(testFn)();
}

describe(
  "Simple store",
  createSharedTest((defineFn) => {
    class Store {
      count = 1;
      get double() {
        return this.count * 2;
      }
      inc() {
        this.count++;
      }
    }
    const useStore = defineFn(Store);
    const store = useStore();

    expect(store.count).toBe(1);
    expect(store.double).toBe(2);
    store.inc();
    expect(store.count).toBe(2);
    expect(store.double).toBe(4);
  })
);

describe("Inheritance", () => {
  runSharedTest((defineFn) => {
    class Base {
      baseCount = 1;
      baseAction() {
        this.baseCount++;
      }
    }
    class Store extends Base {
      childCount = 2;
      childAction() {
        this.childCount++;
      }
    }

    const useStore = defineFn(Store);
    const store = useStore();

    expect(store.baseCount).toBe(1);
    expect(store.childCount).toBe(2);
    store.baseAction();
    expect(store.baseCount).toBe(2);
    expect(store.childCount).toBe(2);
    store.childAction();
    expect(store.baseCount).toBe(2);
    expect(store.childCount).toBe(3);
  });

  describe(
    "Override",
    createSharedTest((defineFn) => {
      class Base {
        baseCount = 1;
        baseAction() {
          this.baseCount++;
        }
      }
      class Store extends Base {
        baseCount = 2;
        baseAction() {
          this.baseCount *= 2;
        }
      }

      const useStore = defineFn(Store);
      const store = useStore();

      expect(store.baseCount).toBe(2);
      store.baseAction();
      expect(store.baseCount).toBe(4);
    })
  );
});

describe(
  "Setup function with no return value",
  createSharedTest((defineFn) => {
    const fn = vi.fn();

    class Store {
      count = 1;
      setup() {
        watchEffect(() => fn(this.count), { flush: "sync" });
      }
    }

    const useStore = defineFn(Store);
    const store = useStore();

    expect(fn).toHaveBeenCalledTimes(1);
    store.count++;
    expect(fn).toHaveBeenCalledTimes(2);
  })
);

describe("Setup Store", () => {
  test("Writable computed", () => {
    class Store {
      count = 1;
      get double() {
        return this.count * 2;
      }
      set double(v) {
        this.count = v / 2;
      }
    }

    const useStore = defineSetupStore(Store);
    const store = useStore();

    expect(store.double).toBe(2);
    store.double = 10;
    expect(store.count).toBe(5);
    expect(store.double).toBe(10);
  });

  test("Setup return merge", () => {
    class Store {
      count = 1;
      setup() {
        const double = computed(() => this.count * 2);
        const inc = () => this.count++;
        return { double, inc };
      }
    }

    const useStore = defineSetupStore(Store);
    const store = useStore();

    expect(store.double).toBe(2);
    store.inc();
    expect(store.count).toBe(2);
    expect(store.double).toBe(4);
  });

  test("Setup return override", () => {
    class Store {
      count = 1;
      get double() {
        return "double";
      }

      setup() {
        const double = computed(() => this.count * 2);
        return { double };
      }
    }

    const useStore = defineSetupStore(Store);
    const store = useStore();

    expect(store.double).toBe(2);
  });
});

describe("Pinia property accessing", () => {
  describe(
    "Common properties",
    createSharedTest((defineFn) => {
      class Store {
        count = 1;
        get f(): number {
          return useContext<Store>(this).$state.count;
        }
        increaseByPatching() {
          useContext<Store>(this).$patch({ count: this.count + 1 });
        }
      }

      type A = StateTree<Store>;

      const useStore = defineFn(Store);
      const store = useStore();

      expect(store.f).toBe(1);
      store.increaseByPatching();
      expect(store.f).toBe(2);
    })
  );

  test("$reset (Option only)", () => {
    class Store {
      count = 1;
      increment() {
        this.count++;
      }
      reset() {
        useContext(this).$reset();
      }
    }

    const useStore = defineOptionStore(Store);
    const store = useStore();

    expect(store.count).toBe(1);
    store.increment();
    expect(store.count).toBe(2);
    store.reset();
    expect(store.count).toBe(1);
  });

  describe(
    "Custom property",
    createSharedTest((defineFn) => {
      class Store {
        count = 1;
        get a() {
          return (this as any).$test;
        }
      }

      const pinia = getActiveTestingPinia();
      pinia.use(() => ({ $test: "test" }));

      const useStore = defineFn(Store);
      const store = useStore();
      expect(store.a).toBe("test");
    })
  );
});

describe(
  "Setup should be called once",
  createSharedTest((defineFn) => {
    const fn = vi.fn();

    class Store {
      count = 1;
      setup() {
        fn();
      }
    }

    const useStore = defineOptionStore(Store);
    const _storeA = useStore();
    expect(fn).toHaveBeenCalledTimes(1);
    const _storeB = useStore();
    expect(fn).toHaveBeenCalledTimes(1);
  })
);

describe(
  "Setup should not accessible in store",
  createSharedTest((defineFn) => {
    class Store {
      count = 1;
      setup() {
        this.count += 1;
      }
    }

    const useStore = defineFn(Store);
    const store = useStore();
    expect(store.count).toBe(2);
    expect((store as any).setup).toBeUndefined();
  })
);

describe(
  "External store as state",
  createSharedTest((defineFn) => {
    class BaseStore {
      count = 1;
    }
    const useBaseStore = defineFn(BaseStore);
    const baseStore = useBaseStore();
    const fn = vi.fn();

    class Store {
      base = useBaseStore();
      setup() {
        watchEffect(() => fn(this.base.count), { flush: "sync" });
      }
    }

    const useStore = defineFn(Store);
    const store = useStore();
    expect(baseStore.count).toBe(1);
    expect(store.base.count).toBe(1);
    expect(fn).toBeCalledTimes(1);
    baseStore.count++;
    expect(baseStore.count).toBe(2);
    expect(store.base.count).toBe(2);
    expect(fn).toBeCalledTimes(2);
  })
);

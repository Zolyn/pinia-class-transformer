import { computed } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, expect, test, describe } from 'vitest'
import { defineOptionStore, defineSetupStore, useContext } from '../src'
import type { SetupStore } from '../src/setupStore'
import type { OptionStore } from '../src/optionStore'
import type { Class } from 'type-fest'

beforeEach(() => setActivePinia(createPinia()))

type SetupStoreFn = <S extends object>(storeClass: Class<S>) => SetupStore<S>
type OptionStoreFn = <S extends object>(storeClass: Class<S>) => OptionStore<S>

function runSharedTest(testFn: (defineFn: SetupStoreFn | OptionStoreFn) => void) {
  test.each([
    ['Option', defineOptionStore],
    ['Setup', defineSetupStore]
  ])('%s', (_, defineFn) => {
    testFn(defineFn)
  })
}

describe('Simple store', () => {
  runSharedTest((defineFn) => {
    class Store {
      count = 1;
      get double() { return this.count * 2 }
      inc() { this.count++ }
    }
    const useStore = defineFn(Store);
    const store = useStore();

    expect(store.count).toBe(1);
    expect(store.double).toBe(2);
    store.inc();
    expect(store.count).toBe(2);
    expect(store.double).toBe(4);
  })
})

describe('Inheritance', () => {
  runSharedTest((defineFn) => {
    class Base {
      baseCount = 1;
      baseAction() {
        this.baseCount++
      }
    }
    class Store extends Base {
      childCount = 2;
      childAction() {
        this.childCount++
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
  })

  describe('Override', () => {
    runSharedTest((defineFn) => {
      class Base {
        baseCount = 1;
        baseAction() {
          this.baseCount++
        }
      }
      class Store extends Base {
        baseCount = 2;
        baseAction() {
          this.baseCount *= 2
        }
      }

      const useStore = defineFn(Store);
      const store = useStore();

      expect(store.baseCount).toBe(2);
      store.baseAction();
      expect(store.baseCount).toBe(4);
    })
  })
})

describe('Setup Store', () => {
  test('Writable computed', () => {
    class Store {
      count = 1;
      get double() { return this.count * 2 }
      set double(v) { this.count = v / 2 }
    }

    const useStore = defineSetupStore(Store);
    const store = useStore();

    expect(store.double).toBe(2);
    store.double = 10;
    expect(store.count).toBe(5);
    expect(store.double).toBe(10);
  })

  test('Setup return merge', () => {
    class Store {
      count = 1;
      setup() {
        const double = computed(() => this.count * 2)
        const inc = () => this.count++
        return { double, inc }
      }
    }

    const useStore = defineSetupStore(Store);
    const store = useStore();

    expect(store.double).toBe(2);
    store.inc();
    expect(store.count).toBe(2);
    expect(store.double).toBe(4);
  })

  test('Setup return override', () => {
    class Store {
      count = 1;
      get double() { return 'double' }

      setup() {
        const double = computed(() => this.count * 2)
        return { double }
      }
    }

    const useStore = defineSetupStore(Store);
    const store = useStore();

    expect(store.double).toBe(2);
  })
})

describe('Pinia property accessing', () => {
  runSharedTest((defineFn) => {
    class Store {
      count = 1;
      f() {
        return useContext(this).$state
      }
    }

    const useStore = defineFn(Store);
    const store = useStore();

    expect(store.f().count).toBe(1);
  })
})
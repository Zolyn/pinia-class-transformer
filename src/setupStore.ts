import { defineStore, getActivePinia, type Pinia, type StoreDefinition, type StoreGeneric } from "pinia";
import { type Ref, ref, type ComputedRef, computed } from "vue";
import { getAllDescriptors } from "./utils";
import type { Class, Merge } from "type-fest";
import type { ActionsTree, Method, StateTree, GettersTree } from "./types/shared";
import type { SetupActions, SetupGetters, SetupState } from "./types/setup";

type RuntimePinia = Pinia & {
    _s: Map<string, StoreGeneric>
}

function getRuntimePinia() {
    return getActivePinia() as RuntimePinia | undefined
}

function transformClass<S extends object>(id: string, storeClass: Class<S>) {
    const result: Record<string, Ref | ComputedRef | Method> = {};
    const store = getRuntimePinia()!._s.get(id);
    let setupFn: Method | undefined;

    const instance = new storeClass();
    const instanceDescriptors = Object.getOwnPropertyDescriptors(instance);
    for (const key in instanceDescriptors) {
        const desc = instanceDescriptors[key];
        result[key] = ref(desc.value)
    }

    const protoDescriptors = getAllDescriptors(storeClass.prototype);
    for (const key in protoDescriptors) {
        if (key === 'constructor') {
            continue;
        }

        const desc = protoDescriptors[key];
        const getter = desc.get;
        const setter = desc.set;
        const method = desc.value;

        if (typeof method === 'function') {
            if (key === 'setup') {
                setupFn = method
                continue
            }

            result[key] = method
            continue
        }

        if (!getter) {
            continue
        }

        // Still no clue why the internal implementation of `defineOptionStore()` in Pinia calls `setActivePinia()` before creating computed and wraps computed in `markRaw`
        // Currently we don't do 1:1 mapping of it
        if (!setter) {
            result[key] = computed(getter.bind(store))
        } else {
            result[key] = computed({
                get: getter.bind(store),
                set: setter.bind(store)
            })
        }
    }

    if (setupFn) {
        const setupResult = setupFn.call(store);

        if (setupResult && typeof setupResult === 'object') {
            Object.assign(result, setupResult)
        }
    }

    return result
}

export type SetupStore<S extends object> = StoreDefinition<string, Merge<StateTree<S>, SetupState<S>>, Merge<GettersTree<S>, SetupGetters<S>>, Merge<ActionsTree<S>, SetupActions<S>>>;

export function defineSetupStore<S extends object>(storeClass: Class<S>): SetupStore<S>

export function defineSetupStore<S extends object>(id: string, storeClass: Class<S>): SetupStore<S>

export function defineSetupStore<S extends object>(idOrClass: string | Class<S>, _storeClass?: Class<S>) {
    let id: string;
    let storeClass: Class<S>;

    if (typeof idOrClass === 'string') {
        id = idOrClass;
        storeClass = _storeClass!;
    } else {
        id = idOrClass.name;
        storeClass = idOrClass;
    }

    return defineStore(id, () => transformClass(id, storeClass))
}

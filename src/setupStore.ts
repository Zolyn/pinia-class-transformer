import { defineStore, type StoreDefinition } from "pinia";
import type { Class, Merge } from "type-fest";
import { type Ref, ref, type ComputedRef, computed, reactive } from "vue";
import type { ActionsTree, Method, StateTree, GettersTree } from "./types/shared";
import { getAllDescriptors } from "./utils";
import type { SetupActions, SetupGetters, SetupState } from "./types/setup";

function transformClass<S extends object>(storeClass: Class<S>) {
    const result: Record<string, Ref | ComputedRef | Method> = {};
    const unwrapProxy = reactive(result);
    let setupFn: Method | undefined;

    const instance = new storeClass();
    const instanceDescriptors = Object.getOwnPropertyDescriptors(instance);
    for (const key in instanceDescriptors) {
        const desc = instanceDescriptors[key];
        result[key]  = ref(desc.value)
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
               setupFn = method;
               continue
            }
            
            result[key] = method
            continue
        }
        
        if (!getter) {
            continue
        }

        if (!setter) {
            result[key] = computed(getter.bind(unwrapProxy))
        } else {
            result[key] = computed({
                get: getter.bind(unwrapProxy),
                set: setter.bind(unwrapProxy)
            })
        }
    }

    if (setupFn) {
        const setupResult = setupFn.call(unwrapProxy);

        if (setupResult && typeof setupResult === 'object') {
            Object.assign(result, setupResult)
        }
    }
    
    return result
}

type SetupStore<S extends object> = StoreDefinition<string, Merge<StateTree<S>, SetupState<S>>, Merge<GettersTree<S>, SetupGetters<S>>, Merge<ActionsTree<S>, SetupActions<S>>>;

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

    return defineStore(id, () => transformClass(storeClass))
}

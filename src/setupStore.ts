import { defineStore, type StoreDefinition } from "pinia";
import type { Class } from "type-fest";
import { type Ref, ref, type ComputedRef, computed, reactive } from "vue";
import type { ActionsTree, Method, StateTree, GettersTree } from "./types/shared";
import { getAllDescriptors } from "./utils";

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

        if (getter && !setter) {
            result[key] = computed(getter.bind(unwrapProxy))
            continue
        }

        if (typeof method === 'function') {
            if (key === 'setup') {
               setupFn = method;
               continue
            }
            
            result[key] = method
        }
    }

    if (setupFn) {
        setupFn.call(unwrapProxy)
    }
    
    return result
}

export function defineSetupStore<S extends object>(storeClass: Class<S>): StoreDefinition<string, StateTree<S>, GettersTree<S>, Omit<ActionsTree<S>, 'setup'>>

export function defineSetupStore<S extends object>(id: string, storeClass: Class<S>): StoreDefinition<string, StateTree<S>, GettersTree<S>, Omit<ActionsTree<S>, 'setup'>>

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

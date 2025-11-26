import { defineStore, type DefineStoreOptions, type StoreDefinition } from "pinia";
import { getAllDescriptors } from "./utils";
import type { ActionsTree, Method, StateTree, GettersTree } from "./types/shared";
import type { Class } from "type-fest";

const SETUP_CALLED = Symbol();

function buildState<S extends object>(storeClass: Class<S>) {
    const storeInstance = new storeClass();
    const state: Record<string, any> = {};

    const instanceDescriptors = Object.getOwnPropertyDescriptors(storeInstance);
    for (const key in instanceDescriptors) {
        const desc = instanceDescriptors[key];
        state[key] = desc.value;
    }

    return state;
}

function buildGettersAndActions<S extends object>(storeClass: Class<S>) {
    const getters: Record<string, Method> = {};
    const actions: Record<string, Method> = {};
    let setupFn: Method | undefined;

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
            getters[key] = getter;
            continue
        }

        if (typeof method === 'function') {
            if (key === 'setup') {
                setupFn = method;
                continue;
            }

            actions[key] = method
        }
    }

    return { getters, actions, setupFn };
}

export type OptionStore<S extends object> = StoreDefinition<string, StateTree<S>, GettersTree<S>, ActionsTree<S>>;
export type DefineOptions<S extends object> = DefineStoreOptions<string, StateTree<S>, GettersTree<S>, ActionsTree<S>>;

export function defineOptionStore<S extends object>(storeClass: Class<S>, options?: DefineOptions<S>): OptionStore<S>;

export function defineOptionStore<S extends object>(id: string, storeClass: Class<S>, options?: DefineOptions<S>): OptionStore<S>;

export function defineOptionStore<S extends object>(idOrClass: string | Class<S>, classOrOptions?: Class<S> | DefineOptions<S>, _options?: DefineOptions<S>) {
    let id: string;
    let storeClass: Class<S>;
    let options: DefineOptions<S> | undefined;

    if (typeof idOrClass === 'string') {
        id = idOrClass;
        storeClass = classOrOptions! as Class<S>;
        options = _options;
    } else {
        id = idOrClass.name;
        storeClass = idOrClass;
        options = classOrOptions as DefineOptions<S> | undefined;
    }

    const { getters, actions, setupFn } = buildGettersAndActions(storeClass);

    const useStore = defineStore(id, {
        state: () => buildState(storeClass),
        getters,
        actions,
        ...options
    } as any);

    if (setupFn) {
        function wrappedUseStore(...args: any[]) {
            const store = useStore(...args);

            if (!(store as any)[SETUP_CALLED]) {
                (store as any)[SETUP_CALLED] = true;
                setupFn!.call(store);
            }

            return store;
        }

        wrappedUseStore.$id = useStore.$id;
        return wrappedUseStore;
    }

    return useStore;
}

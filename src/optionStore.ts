import { defineStore, type StoreDefinition } from "pinia";
import type { ActionsTree, Method, StateTree, GettersTree } from "./types/shared";
import type { Class } from "type-fest";
import { getAllDescriptors } from "./utils";

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
            actions[key] = method
        }
    }

    return { getters, actions };
}

type OptionStore<S extends object> = StoreDefinition<string, StateTree<S>, GettersTree<S>, ActionsTree<S>>;

export function defineOptionStore<S extends object>(storeClass: Class<S>): OptionStore<S>;

export function defineOptionStore<S extends object>(id: string, storeClass: Class<S>): OptionStore<S>;

export function defineOptionStore<S extends object>(idOrClass: string | Class<S>, _storeClass?: Class<S>) {
    let id: string;
    let storeClass: Class<S>;

    if (typeof idOrClass === 'string') {
        id = idOrClass;
        storeClass = _storeClass!;
    } else {
        id = idOrClass.name;
        storeClass = idOrClass;
    }

    const { getters, actions } = buildGettersAndActions(storeClass);

    return defineStore(id, {
        state: () => buildState(storeClass),
        getters,
        actions
    } as any);
}

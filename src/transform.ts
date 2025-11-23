import { defineStore, type StoreDefinition } from "pinia";
import type { ActionsTree, GettersTree, Method, StateTree } from "./types";
import type { Class } from "type-fest";

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

function buildGetters<S extends object>(storeClass: Class<S>) {
    const getters: Record<string, Method> = {};
    const protoDescriptors = Object.getOwnPropertyDescriptors(storeClass.prototype);

    for (const key in protoDescriptors) {
        if (key === 'constructor') {
            continue;
        }

        const desc = protoDescriptors[key];
        const getter = desc.get;
        const setter = desc.set;

        // TODO: Support writable computed
        if (getter && !setter) {
            getters[key] = getter
        }
    }

    return getters;
}

interface BuildActionsResult {
    actions: Record<string, Method>;
    setupFn?: Method;
}

function buildActions<S extends object>(storeClass: Class<S>): BuildActionsResult {
    const actions: Record<string, Method> = {};
    let setupFn: Method | undefined;

    const protoDescriptors = Object.getOwnPropertyDescriptors(storeClass.prototype);
    for (const key in protoDescriptors) {
        if (key === 'constructor') {
            continue;
        }

        const desc = protoDescriptors[key];
        const method = desc.value;

        if (typeof method !== 'function') {
            continue;
        }

        if ((method as Method).name === 'setup') {
            setupFn = method;
            continue;
        }

        actions[key] = method;
    }

    return {
        actions,
        setupFn
    };
}

export function defineClassStore<S extends object>(storeClass: Class<S>): StoreDefinition<string, StateTree<S>, GettersTree<S>, ActionsTree<S>>;

export function defineClassStore<S extends object>(id: string, storeClass: Class<S>): StoreDefinition<string, StateTree<S>, GettersTree<S>, ActionsTree<S>>;

export function defineClassStore<S extends object>(arg1: string | Class<S>, arg2?: Class<S>) {
    let id: string;
    let storeClass: Class<S>;

    if (typeof arg1 === 'string') {
        id = arg1;
        storeClass = arg2!;
    } else {
        id = arg1.name;
        storeClass = arg1;
    }

    const getters = buildGetters(storeClass);
    const { actions, setupFn } = buildActions(storeClass);

    return defineStore(id, {
        state: () => buildState(storeClass),
        setup: setupFn,
        getters,
        actions
    } as any);
}

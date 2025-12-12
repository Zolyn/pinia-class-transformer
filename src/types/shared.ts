import type { ConditionalPick, ConditionalExcept, ReadonlyKeysOf } from "type-fest";

type Method = (...args: any[]) => any;

type MethodTree<S> = ConditionalPick<S, Method>;

type ActionsTree<S> = Omit<MethodTree<S>, 'setup'>;

type DataTree<S> = ConditionalExcept<S, Method>

type GetterKeys<S> = ReadonlyKeysOf<DataTree<S>>

type StateTree<S> = Omit<DataTree<S>, GetterKeys<S>>;

type GettersTree<S> = {
    [K in GetterKeys<S>]: () => DataTree<S>[K]
}

export type {
    Method,
    MethodTree,
    ActionsTree,
    DataTree,
    GetterKeys,
    StateTree,
    GettersTree
}

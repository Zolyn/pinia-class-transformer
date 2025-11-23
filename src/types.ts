import type { ConditionalExcept, ConditionalPick, ReadonlyKeysOf } from "type-fest";

type Method = (...args: any[]) => any;

type ActionsTree<S> = ConditionalPick<S, Method>;

type DataTree<S> = ConditionalExcept<S, Method>

type GetterKeys<S> = ReadonlyKeysOf<DataTree<S>>

type StateTree<S> = Omit<DataTree<S>, GetterKeys<S>>;

type GettersTree<S> = {
    [K in GetterKeys<S>]: () => DataTree<S>[K]
}

export type {
    Method,
    ActionsTree,
    DataTree,
    StateTree,
    GettersTree
}

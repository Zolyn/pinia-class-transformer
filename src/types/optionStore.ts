import type { ConditionalExcept, ReadonlyKeysOf } from "type-fest";
import type { Method } from "./shared";

type DataTree<S> = ConditionalExcept<S, Method>

type GetterKeys<S> = ReadonlyKeysOf<DataTree<S>>

type StateTree<S> = Omit<DataTree<S>, GetterKeys<S>>;

type GettersTree<S> = {
    [K in GetterKeys<S>]: () => DataTree<S>[K]
}

export type {
    DataTree,
    GetterKeys,
    StateTree,
    GettersTree
}

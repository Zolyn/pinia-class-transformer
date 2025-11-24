import type { ConditionalPick } from "type-fest";

type Method = (...args: any[]) => any;

type ActionsTree<S> = ConditionalPick<S, Method>;

export type {
    Method,
    ActionsTree
}

import type { _StoreWithState, PiniaCustomProperties } from "pinia";
import type { ActionsTree, GettersTree, StateTree } from "./types/shared";

export const ContextSymbol = Symbol() as any;

export type Context<S extends object> = S & _StoreWithState<string, StateTree<S>, GettersTree<S>, ActionsTree<S>> & PiniaCustomProperties;
export type GetterContext<S extends object> = S & PiniaCustomProperties;

export function useContext<S extends object>(storeClass: S) {
    return storeClass as Context<S>
}

export function useGetterContext<S extends object>(storeClass: S) {
    return storeClass as GetterContext<S>
}

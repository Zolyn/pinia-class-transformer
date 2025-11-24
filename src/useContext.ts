import type { _StoreWithState, PiniaCustomProperties } from "pinia";
import type { ActionsTree, GettersTree, StateTree } from "./types/shared";

export function useContext<S extends object>(storeClass: S) {
    return storeClass as S & _StoreWithState<string, StateTree<S>, GettersTree<S>, ActionsTree<S>> & PiniaCustomProperties
}

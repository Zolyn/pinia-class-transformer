import { type ComputedRef, type UnwrapRef } from "vue"
import type { ActionsTree, DataTree } from "./shared"
import type { ConditionalKeys } from "type-fest";

type SetupReturn<S> = S extends { setup(): infer R } ? R : {}

type SetupActions<S> = ActionsTree<SetupReturn<S>>

type SetupData<S> = DataTree<SetupReturn<S>>;

type SetupGetterKeys<S> = ConditionalKeys<SetupData<S>, ComputedRef>

type SetupState<S> = {
    [K in Exclude<keyof SetupData<S>, SetupGetterKeys<S>>]: UnwrapRef<SetupData<S>[K]>
}

type SetupGetters<S> = {
    [K in SetupGetterKeys<S>]: () => UnwrapRef<SetupData<S>[K]>
}

export type {
    SetupState,
    SetupGetters,
    SetupActions
}

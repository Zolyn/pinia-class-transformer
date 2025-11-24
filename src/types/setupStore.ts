import type { ConditionalExcept, IsReadonlyKeyOf } from "type-fest";
import type { Method } from "./shared";
import type { ComputedRef, Ref } from "vue";

export type DataTree<S extends object> = {
    [K in keyof ConditionalExcept<S, Method>]: IsReadonlyKeyOf<S, K> extends true ? ComputedRef<S[K]> : Ref<S[K]>
}

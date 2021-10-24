import { MetaDataKeys } from './types';
import { StateTree, ActionsTree, GettersTree, DefineStoreOptions } from 'pinia';

/**
 * Store装饰器工厂
 *
 * @param id - Store的标识符
 *
 * @public
 */
export function Store(id: string): ClassDecorator {
    return (StoreConstructor: Function) => {
        // Avoid typesript warning
        const ins = new StoreConstructor.prototype.constructor();
        const states: StateTree = {};
        Object.getOwnPropertyNames(ins).map((state): undefined => {
            const descriptor = Object.getOwnPropertyDescriptor(ins, state);
            if (descriptor) {
                states[state] = descriptor.value;
            }

            return undefined;
        });

        const getters: GettersTree<StateTree> = {};
        Object.getOwnPropertyNames(StoreConstructor.prototype).map((getter): undefined => {
            const descriptor = Object.getOwnPropertyDescriptor(StoreConstructor.prototype, getter);
            if (descriptor?.get) {
                getters[getter] = descriptor.get;
            }

            return undefined;
        });

        const actions: ActionsTree = Reflect.getMetadata(MetaDataKeys.Actions, ins) ?? {};

        const storeOptions: DefineStoreOptions<string, StateTree, GettersTree<StateTree>, ActionsTree> = {
            id,
            state: () => states,
            getters,
            actions,
        };

        Reflect.defineMetadata(MetaDataKeys.StoreOptions, storeOptions, StoreConstructor);
    };
}

import { collectGettersAndActions, mergeObjectArray } from './utils';
import { Ctor, MetaDataKeys } from './types';
import { StateTree, _ActionsTree, _GettersTree, DefineStoreOptions } from 'pinia';

/**
 * Store装饰器工厂
 *
 * @public
 */
export function Store(StoreConstructor: Ctor): void {
    const ins = new StoreConstructor();

    const states: StateTree = {};

    Object.getOwnPropertyNames(ins).map((state): undefined => {
        const descriptor = Object.getOwnPropertyDescriptor(ins, state);
        if (descriptor) {
            states[state] = descriptor.value;
        }

        return undefined;
    });

    const { getters, actions } = mergeObjectArray(collectGettersAndActions(StoreConstructor).reverse());

    const storeOptions: DefineStoreOptions<string, StateTree, _GettersTree<StateTree>, _ActionsTree> = {
        id: 'default id',
        state: () => states,
        getters,
        actions,
    };

    Reflect.defineMetadata(MetaDataKeys.Sign, 'sign', StoreConstructor);
    Reflect.defineMetadata(MetaDataKeys.StoreOptions, storeOptions, StoreConstructor);
}

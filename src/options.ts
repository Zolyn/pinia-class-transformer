import { DefineStoreOptions } from 'pinia';
import { StatesAndGetters, Actions, Constructor, MetaDataKeys } from './types';

/**
 * 获取目标类的Store选项
 *
 * @param StoreClass - 用于编写Store的类
 *
 * @public
 */
export function getOptions<I extends string, C>(
    StoreClass: Constructor,
): DefineStoreOptions<I, StatesAndGetters<C>, any, Actions<C>> {
    return Reflect.getMetadata(MetaDataKeys.StoreOptions, StoreClass) as DefineStoreOptions<
        I,
        StatesAndGetters<C>,
        any,
        Actions<C>
    >;
}

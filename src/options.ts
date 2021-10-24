import { DefineStoreOptions } from 'pinia';
import { StatesAndGetters, Actions, MetaDataKeys } from './types';

/**
 * 获取目标类的Store选项
 *
 * @param StoreId - Store的标识符
 * @param StoreClass - 用于编写Store的类
 *
 * @public
 */
export function getOptions<I extends string, C extends object>(StoreId: I, StoreClass: C) {
    const storeOptionsWithoutId = Reflect.getMetadata(
        MetaDataKeys.StoreOptions,
        Object.getPrototypeOf(StoreClass).constructor,
    );
    const storeOptions: DefineStoreOptions<I, StatesAndGetters<C>, any, Actions<C>> = {
        ...storeOptionsWithoutId,
        id: StoreId,
    };

    return storeOptions;
}

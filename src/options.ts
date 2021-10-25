import { DefineStoreOptions } from 'pinia';
import { StatesAndGetters, Actions, MetaDataKeys } from './types';

/**
 * 根据给定的Store名称与类创建并返回定义Store的选项
 *
 * @param StoreId - Store的名称
 * @param StoreClass - 编写Store的类
 *
 * @public
 */
export function createOptions<I extends string, C extends object>(StoreId: I, StoreClass: C) {
    const storeOptionsBase = Reflect.getMetadata(
        MetaDataKeys.StoreOptions,
        Object.getPrototypeOf(StoreClass).constructor,
    );
    const storeOptions: DefineStoreOptions<I, StatesAndGetters<C>, any, Actions<C>> = {
        ...storeOptionsBase,
        id: StoreId,
    };

    return storeOptions;
}

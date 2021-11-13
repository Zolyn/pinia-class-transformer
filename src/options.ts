import { DefineStoreOptions } from 'pinia';
import { ValueOf } from 'type-fest';
import { StatesAndGetters, Actions, Ctor, MetaDataKeys } from './types';

/**
 * 根据给定的名称与类创建并返回定义Store的选项
 *
 * @param StoreId - Store的名称
 * @param StoreConstructor - 编写Store的类（构造函数）
 *
 * @public
 */
export function createOptions<I extends string, C extends Ctor>(StoreId: I, StoreConstructor: C) {
    const storeOptionsBase = Reflect.getMetadata(MetaDataKeys.StoreOptions, StoreConstructor);
    const storeOptions: DefineStoreOptions<I, StatesAndGetters<ValueOf<C>>, any, Actions<ValueOf<C>>> = {
        ...storeOptionsBase,
        id: StoreId,
    };

    return storeOptions;
}

import { ConditionalPick, ConditionalExcept } from 'type-fest';
import { _ActionsTree, _GettersTree, StateTree } from 'pinia';

/**
 * 由Getters和Actions组成的对象
 *
 * @public
 */
interface GettersAndActions {
    getters: _GettersTree<StateTree>;
    actions: _ActionsTree;
}

/**
 * 只有string类型的键的对象
 *
 * @public
 */
interface StringKeyObject {
    [p: string]: any;
}

/**
 * 元数据键名列表
 *
 * @public
 */
const enum MetaDataKeys {
    Sign = 'pinia-store-decorators:Sign',
    StoreOptions = 'pinia-store-decorators:StoreOptions',
}

/**
 * 宽松的函数类型
 *
 * @public
 */
type Func = (...args: any[]) => any;

/**
 * 宽松的构造函数类型
 *
 * @public
 */
type Ctor = new (...args: any[]) => any;

/**
 * Actions类型
 *
 * @public
 */
type Actions<C> = ConditionalPick<C, Func>;

/**
 * States和Getters构成的类型
 *
 * @public
 */
type StatesAndGetters<C> = ConditionalExcept<C, Func>;

export { MetaDataKeys, Func, Ctor, Actions, StatesAndGetters, GettersAndActions, StringKeyObject };

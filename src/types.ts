/**
 * 元数据键名列表
 *
 * @public
 */
enum MetaDataKeys {
    Actions = 'pinia-store-decorators:Actions',
    StoreOptions = 'pinia-store-decorators:StoreOptions',
}

/**
 * 宽松的函数类型
 *
 * @public
 */
type Func = (...args: any[]) => any;

/**
 * 返回对象O中，不能分配给T类型的键名
 *
 * @public
 */
type KeysNotExtends<O, T> = Exclude<
    {
        [P in keyof O]: O[P] extends T ? O[P] : P;
    }[keyof O],
    T
>;

/**
 * Actions类型
 *
 * @public
 */
type Actions<C> = Omit<C, KeysNotExtends<C, Func>>;

/**
 * States和Getters构成的类型
 *
 * @public
 */
type StatesAndGetters<C> = Pick<C, KeysNotExtends<C, Func>>;

export { MetaDataKeys, Func, KeysNotExtends, Actions, StatesAndGetters };

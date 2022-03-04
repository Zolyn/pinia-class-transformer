import { ConditionalPick, ConditionalExcept } from 'type-fest';
import { ComputedRef, Ref } from 'vue';

/**
 * 键类型为string的对象
 *
 * @internal
 */
type _StringKeyObject = Record<string, any>;

/**
 * 宽松的函数类型
 *
 * @public
 */
type Func = (...args: any[]) => any;

/**
 * Actions类型
 *
 * @public
 */
type Actions<S> = Omit<ConditionalPick<S, Func>, 'setup'>;

/**
 * 对象S中除Func类型之外的类型
 *
 * @public
 */
type ExcludeFunc<S> = ConditionalExcept<S, Func>;

/**
 * 经过ref()函数转化的State
 *
 * @public
 */
type ReactiveStateTree<S extends object> = {
    [K in keyof ExcludeFunc<S>]: Ref<ExcludeFunc<S>[K]>;
};

/**
 * 经过computed()函数转化的Getters
 *
 * @public
 */
type ReactiveGettersTree<S extends object> = {
    [K in keyof ExcludeFunc<S>]: ComputedRef<ExcludeFunc<S>[K]>;
};

/**
 * 转换结果
 *
 * @public
 */
type TransformResult<S extends object, F extends object> = ReactiveStateTree<S> & ReactiveGettersTree<F> & Actions<F>;

/**
 * 定义Store的setup函数
 *
 * @public
 */
type StoreSetup<S extends object, F extends object = Actions<S>> = () => TransformResult<S, F>;

export {
    _StringKeyObject,
    Func,
    Actions,
    ExcludeFunc,
    ReactiveStateTree,
    ReactiveGettersTree,
    TransformResult,
    StoreSetup,
};

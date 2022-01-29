import { ConditionalPick, ConditionalExcept, Class } from 'type-fest';
import { ComputedRef, Ref } from 'vue';
import { StoreFragment } from './storeFragment';

/**
 * 键类型为string的对象
 *
 * @internal
 */
interface _StringKeyObject {
    [p: string]: any;
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
 * @internal
 */
type _Ctor = new (...args: any[]) => any;

/**
 * Actions类型
 *
 * @public
 */
type Actions<C> = Omit<ConditionalPick<C, Func>, 'setup'>;

/**
 * 对象C中除_Func类型之外的类型
 *
 * @public
 */
type ExcludeFunc<C> = ConditionalExcept<C, Func>;

/**
 * 经过ref()函数转化的State
 *
 * @public
 */
type ReactiveStateTree<C extends object> = {
    [K in keyof ExcludeFunc<C>]?: Ref<ExcludeFunc<C>[K]>;
};

/**
 * 经过computed()函数转化的Getters
 *
 * @public
 */
type ReactiveGettersTree<C extends object> = {
    [K in keyof ExcludeFunc<C>]?: ComputedRef<ExcludeFunc<C>[K]>;
};

/**
 * 转换选项
 *
 * @public
 */
interface TransformOptions<C extends object, CC extends StoreFragment<C, CC>> {
    state: Class<C>;
    fragment: Class<CC>;
}

/**
 * 转换结果
 *
 * @public
 */
type TransformResult<C extends object, CC extends object> = ReactiveStateTree<C> &
    ReactiveGettersTree<CC> &
    Actions<CC>;

export {
    _StringKeyObject,
    Func,
    _Ctor,
    Actions,
    ExcludeFunc,
    ReactiveStateTree,
    ReactiveGettersTree,
    TransformOptions,
    TransformResult,
};

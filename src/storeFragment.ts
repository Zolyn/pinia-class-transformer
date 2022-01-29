import { Actions, ExcludeFunc, Func, ReactiveGettersTree, ReactiveStateTree, TransformResult } from './types';
import { Class } from 'type-fest';
import { _ActionsTree, _GettersTree, StateTree } from 'pinia';

/**
 * Store片段类
 *
 * @public
 */
class StoreFragment<S extends object, SS extends object> {
    protected state!: S;
    protected wrappedStore!: TransformResult<S, SS>;
}

/**
 * getStoreFragment 函数返回值
 *
 * @internal
 */
interface _Result<C> {
    actions: Actions<C>;
    getters: ExcludeFunc<C>;
    setup?: Func;
}

/**
 * 获取Store片段
 *
 * @param Fragment - Store片段类
 *
 * @internal
 */
function _getStoreFragment<C extends object, CC extends StoreFragment<C, CC>>(
    Fragment: Class<StoreFragment<C, CC>>,
): _Result<C> {
    const actions: _ActionsTree = {};
    const getters: _GettersTree<StateTree> = {};
    let setup: Func | undefined;

    // 获取类的方法（Actions）
    Object.getOwnPropertyNames(Fragment.prototype).map((propertyName) => {
        const descriptor = Object.getOwnPropertyDescriptor(Fragment.prototype, propertyName);
        const getter = descriptor?.get;
        const setter = descriptor?.set;
        const func = descriptor?.value;

        if (getter && !setter) {
            getters[propertyName] = getter;
        }

        // 排除构造函数
        if (typeof func === 'function' && func !== Fragment) {
            if (func.name === 'setup') {
                setup = func;
            } else {
                actions[propertyName] = func;
            }
        }
    });

    return { actions, getters, setup } as unknown as _Result<C>;
}

export { StoreFragment, _getStoreFragment, _Result };

import { Actions, ExcludeFunc, Func, ReactiveGettersTree, ReactiveStateTree, TransformResult } from './types';
import { Class } from 'type-fest';
import { _ActionsTree, _GettersTree, StateTree } from 'pinia';

/**
 * Store片段类
 *
 * @public
 */
class StoreFragment<S extends object, WS extends object> {
    protected state!: ExcludeFunc<S>;
    protected wrappedStore!: TransformResult<S, WS>;
}

/**
 * getStoreFragment 函数返回值
 *
 * @internal
 */
interface _Result<F> {
    actions: Actions<F>;
    getters: ExcludeFunc<F>;
    setup?: Func;
}

/**
 * 获取Store片段
 *
 * @param Fragment - Store片段类
 *
 * @internal
 */
function _getStoreFragment<S extends object, F extends StoreFragment<S, F>>(Fragment: Class<F>): _Result<F> {
    const actions: _ActionsTree = {};
    const getters: _GettersTree<StateTree> = {};
    let setup: Func | undefined;

    // 获取Actions和Getters
    Object.getOwnPropertyNames(Fragment.prototype).forEach((propertyName) => {
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

    return { actions, getters, setup } as unknown as _Result<F>;
}

export { StoreFragment, _getStoreFragment, _Result };

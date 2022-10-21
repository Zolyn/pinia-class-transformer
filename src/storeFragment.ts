import { StateTree, _ActionsTree, _GettersTree } from 'pinia';
import { Class } from 'type-fest';
import { Store } from './store';
import { Actions, ExcludeFunc, Func, TransformResult } from './types';

/**
 * Store片段类
 *
 * @public
 */
class StoreFragment<S extends object, F extends object> {
    protected state!: S; // TODO: ExcludeFunc<S> does not work
    protected wrappedStore!: TransformResult<S, F>;
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

    let current = Fragment;

    // 获取Actions和Getters
    do {
        Object.getOwnPropertyNames(current.prototype).forEach((propertyName) => {
            const descriptor = Object.getOwnPropertyDescriptor(current.prototype, propertyName);
            const getter = descriptor?.get;
            const setter = descriptor?.set;
            const func = descriptor?.value;

            if (getter && !setter) {
                getters[propertyName] = getter;
            }

            // 排除构造函数
            if (typeof func === 'function' && func !== current) {
                if (func.name === 'setup') {
                    if (!setup) setup = func;
                } else {
                    actions[propertyName] = func;
                }
            }
        });
    } while (
        (current = Object.getPrototypeOf(current)) &&
        current.prototype !== StoreFragment.prototype &&
        current.prototype !== Store.prototype &&
        current.prototype
    );

    return { actions, getters, setup } as unknown as _Result<F>;
}

export { StoreFragment, _getStoreFragment, _Result };

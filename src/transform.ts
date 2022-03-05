import { computed, ref } from 'vue';
import { _getState } from './state';
import { _getStoreFragment, StoreFragment } from './storeFragment';
import { _createProxy } from './utils';
import {
    Actions,
    Func,
    ReactiveGettersTree,
    ReactiveStateTree,
    _StringKeyObject,
    TransformResult,
    StoreSetup,
} from './types';
import { Class } from 'type-fest';

/**
 * 根proxy容器
 *
 * @internal
 */
interface ProxyContainer<S extends object, F extends StoreFragment<S, F>> extends _StringKeyObject {
    state?: ReactiveStateTree<S>;
    wrappedStore?: TransformResult<S, F>;
}

/**
 * @param storeClass - Store类
 *
 * @public
 */
function transformClass<S extends object>(storeClass: Class<S>): StoreSetup<S>;

/**
 * @param state - State类
 * @param storeFragment - StoreFragment类
 *
 * @public
 */
function transformClass<S extends object, F extends StoreFragment<S, F>>(
    state: Class<S>,
    storeFragment: Class<F>,
): StoreSetup<S, F>;

function transformClass<S extends object, F extends StoreFragment<S, F>>(
    stateOrWhole: Class<S>,
    storeFragment?: Class<F>,
): StoreSetup<S, F> {
    const proxyContainer: ProxyContainer<S, F> = {};
    const rootProxy = _createProxy(proxyContainer);

    // @ts-ignore
    const stateTree: ReactiveStateTree<S> = {};

    Object.entries(_getState(stateOrWhole)).forEach(([key, value]) => {
        const refVal = ref(value);

        if (!storeFragment) {
            Reflect.set(rootProxy, key, refVal);
        }

        Reflect.set(stateTree, key, refVal);
    });

    if (storeFragment) {
        rootProxy.state = _createProxy(stateTree);
    }

    const fragment = storeFragment
        ? _getStoreFragment(storeFragment)
        : _getStoreFragment(stateOrWhole as unknown as Class<F>);

    const { setup } = fragment;

    // @ts-ignore
    const getters: ReactiveGettersTree<F> = {};

    Object.entries(fragment.getters).forEach(([key, value]) => {
        const computedRef = computed((value as Func).bind(rootProxy));

        Reflect.set(rootProxy, key, computedRef);
        Reflect.set(getters, key, computedRef);
    });

    // @ts-ignore
    const actions: Actions<F> = {};

    Object.entries(fragment.actions).forEach(([key, value]) => {
        const boundFunc = (value as Func).bind(rootProxy);

        Reflect.set(rootProxy, key, boundFunc);
        Reflect.set(actions, key, boundFunc);
    });

    const result: TransformResult<S, F> = { ...stateTree, ...getters, ...actions };

    rootProxy.wrappedStore = result;

    return () => {
        if (setup) {
            Reflect.apply(setup, rootProxy, []);
        }

        return result;
    };
}

export { transformClass };

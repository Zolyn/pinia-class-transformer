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
    TransformOptions,
    TransformResult,
} from './types';

/**
 * 根proxy容器
 *
 * @internal
 */
interface ProxyContainer<C extends object, CC extends StoreFragment<C, CC>> extends _StringKeyObject {
    state?: ReactiveStateTree<C>;
    wrappedStore?: TransformResult<C, CC>;
}

/**
 * 转换Class为Pinia setup函数
 *
 * @param options - state: State类，fragment: Store片段类
 *
 * @public
 */
function transformClass<C extends object, CC extends StoreFragment<C, CC>>(
    options: TransformOptions<C, CC>,
): () => TransformResult<C, CC> {
    const proxyContainer: ProxyContainer<C, CC> = {};
    const rootProxy = _createProxy(proxyContainer);

    // @ts-ignore
    const states: ReactiveStateTree<C> = {};
    const stateProxy = _createProxy(states);

    Object.entries(_getState(options.state)).forEach(([key, value]) => {
        Reflect.set(stateProxy, key, ref(value));
    });

    proxyContainer.state = stateProxy;

    const fragment = _getStoreFragment(options.fragment);
    const { setup } = fragment;

    // @ts-ignore
    const getters: ReactiveGettersTree<CC> = {};

    Object.entries(fragment.getters).forEach(([key, value]) => {
        const computedRef = computed((value as Func).bind(rootProxy));
        Reflect.set(rootProxy, key, computedRef);
        Reflect.set(getters, key, computedRef);
    });

    // @ts-ignore
    const actions: Actions<CC> = {};

    Object.entries(fragment.actions).forEach(([key, value]) => {
        const boundFunc = (value as Func).bind(rootProxy);
        Reflect.set(rootProxy, key, boundFunc);
        Reflect.set(actions, key, boundFunc);
    });

    const result: TransformResult<C, CC> = { ...states, ...getters, ...actions };

    proxyContainer.wrappedStore = result;

    return () => {
        if (setup) {
            Reflect.apply(setup, rootProxy, []);
        }

        return result;
    };
}

export { transformClass };

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

    const states: ReactiveStateTree<C> = {};

    Object.entries(_getState(options.state)).map(([key, value]) => {
        // @ts-ignore
        states[key] = ref(value);
    });

    const stateProxy = _createProxy(states);

    proxyContainer.state = stateProxy;

    const fragment = _getStoreFragment(options.fragment);

    const getters: ReactiveGettersTree<CC> = {};

    Object.entries(fragment.getters).map(([key, value]) => {
        // @ts-ignore
        proxyContainer[key] = computed((value as Func).bind(rootProxy));
        // @ts-ignore
        getters[key] = proxyContainer[key];
    });

    // @ts-ignore
    const actions: Actions<CC> = {};

    Object.entries(fragment.actions).map(([key, value]) => {
        // @ts-ignore
        proxyContainer[key] = (value as Func).bind(rootProxy);
        // @ts-ignore
        actions[key] = proxyContainer[key];
    });

    const result: TransformResult<C, CC> = { ...states, ...getters, ...actions };

    proxyContainer.wrappedStore = result;

    return () => {
        if (fragment.setup) {
            fragment.setup.call(rootProxy);
        }

        return result;
    };
}

export { transformClass };

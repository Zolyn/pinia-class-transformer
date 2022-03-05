import { Class } from 'type-fest';
import { ExcludeFunc } from './types';
import { StateTree } from 'pinia';

/**
 * 获取State
 *
 * @param State - State类
 *
 * @internal
 */
function _getState<S extends object>(State: Class<S>): ExcludeFunc<S> {
    const ins = new State();

    const stateTree: StateTree = {};

    // 获取实例属性（State）
    Object.getOwnPropertyNames(ins).forEach((state) => {
        const descriptor = Object.getOwnPropertyDescriptor(ins, state);
        if (descriptor) {
            stateTree[state] = descriptor.value;
        }
    });

    return stateTree as ExcludeFunc<S>;
}

export { _getState };

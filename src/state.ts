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
function _getState<C>(State: Class<C>): ExcludeFunc<C> {
    const ins = new State();

    const states: StateTree = {};

    // 获取实例属性（State）
    Object.getOwnPropertyNames(ins).map((state) => {
        const descriptor = Object.getOwnPropertyDescriptor(ins, state);
        if (descriptor) {
            states[state] = descriptor.value;
        }
    });

    return states as ExcludeFunc<C>;
}

export { _getState };

import { ComputedRef, isRef, Ref } from 'vue';
import { _StringKeyObject } from './types';

/**
 * 创建一个代理对象
 *
 * @param target - 目标对象
 *
 * @internal
 */
function _createProxy<T extends _StringKeyObject>(target: T) {
    return new Proxy(target, {
        get(target: T, p: string): boolean {
            const targetVal = target[p];
            if (isRef(targetVal)) {
                return Reflect.get(targetVal, 'value');
            } else {
                return Reflect.get(target, p);
            }
        },
        set(target: T, p: string, value: any): boolean {
            const targetVal = target[p];
            if (isRef(targetVal)) {
                return Reflect.set(targetVal, 'value', value);
            } else {
                return Reflect.set(target, p, value);
            }
        },
    });
}

/**
 * 强制将Ref类型转换为ComputedRef
 *
 * @param val - Ref类型的响应式变量
 *
 * @public
 */
function c<T>(val: Ref<T>): ComputedRef<T> {
    return val as ComputedRef<T>;
}

/**
 * 将Ref类型转换为Ref，修复部分IDE错误的类型提示
 *
 * @param val - Ref类型的响应式变量
 *
 * @public
 */
function r<T>(val: Ref<T>): Ref<T> {
    return val;
}

export { _createProxy, c, r };

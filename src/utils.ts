import { isRef } from 'vue';

/**
 * 创建一个代理对象
 *
 * @param target - 目标对象
 *
 * @internal
 */
function _createProxy<T extends object>(target: T) {
    return new Proxy(target, {
        get(target: T, p: string | symbol, receiver: any): any {
            // @ts-ignore
            const targetVal = target[p];
            if (isRef(targetVal)) {
                return Reflect.get(targetVal, 'value');
            } else {
                return Reflect.get(target, p);
            }
        },
        set(target: T, p: string | symbol, value: any): boolean {
            // @ts-ignore
            const targetVal = target[p];
            if (isRef(targetVal)) {
                return Reflect.set(targetVal, 'value', value);
            } else {
                return Reflect.set(target, p, value);
            }
        },
    });
}

export { _createProxy };

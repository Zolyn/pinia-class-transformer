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
        get(target: T, p: string | symbol): any {
            // @ts-ignore
            if (isRef(target[p])) {
                // @ts-ignore
                return target[p].value;
            } else {
                // @ts-ignore
                return target[p];
            }
        },
        set(target: T, p: string | symbol, value: any): boolean {
            // @ts-ignore
            if (isRef(target[p])) {
                // @ts-ignore
                target[p].value = value;
            } else {
                // @ts-ignore
                target[p] = value;
            }

            return true;
        },
    });
}

export { _createProxy };

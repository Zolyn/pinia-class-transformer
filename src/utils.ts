import { Ctor, GettersAndActions, MetaDataKeys, StringKeyObject } from './types';

/**
 * 收集目标类定义和继承的的Getters和Actions
 *
 * @param Ctor - 类的构造函数
 *
 * @public
 */
function collectGettersAndActions(Ctor: Ctor): GettersAndActions[] {
    const optionList: GettersAndActions[] = [];
    const getters: GettersAndActions['getters'] = {};
    const actions: GettersAndActions['actions'] = {};

    // 获取类原型上的属性（Getter和Action）
    Object.getOwnPropertyNames(Ctor.prototype).map((propertyName): undefined => {
        const descriptor = Object.getOwnPropertyDescriptor(Ctor.prototype, propertyName);
        const getter = descriptor?.get;
        const setter = descriptor?.set;
        const action = descriptor?.value;

        if (getter && !setter) {
            getters[propertyName] = getter;
        }

        // 排除构造函数
        if (typeof action === 'function' && action !== Ctor) {
            actions[propertyName] = action;
        }

        return undefined;
    });

    optionList.push({ getters, actions });

    const parentObject = Object.getPrototypeOf(Ctor);

    // 继承其他类的情况
    if (parentObject.name !== '') {
        // 若父类被装饰过，提取父类元数据
        const parentStoreOptions = Reflect.getMetadata(MetaDataKeys.StoreOptions, parentObject) as GettersAndActions;
        if (parentStoreOptions) {
            optionList.push({
                getters: parentStoreOptions.getters,
                actions: parentStoreOptions.actions,
            });
        } else {
            optionList.push(...collectGettersAndActions(parentObject));
        }
    }

    return optionList;
}

/**
 * 将对象数组合并成一个对象
 *
 * @param arr - 对象数组
 *
 * @public
 */
function mergeObjectArray<T extends StringKeyObject>(arr: T[]): T {
    let mergedObject = arr[0];
    arr.shift();
    arr.map((obj): undefined => {
        mergedObject = deepMerge(mergedObject, obj);

        return undefined;
    });

    return mergedObject;
}

/**
 * 深度合并两个对象
 *
 * @param target - 目标对象
 * @param merge - 合并对象
 *
 * @public
 */
function deepMerge<T extends StringKeyObject>(target: T, merge: T): T {
    const keys = [...new Set([...Object.keys(target), ...Object.keys(merge)])];
    const mergedObject: StringKeyObject = {};
    keys.map((key): undefined => {
        if (typeof target[key] === 'object' && typeof merge[key] === 'object') {
            mergedObject[key] = deepMerge(target[key], merge[key]);
        } else {
            mergedObject[key] = merge[key] ?? target[key];
        }

        return undefined;
    });

    return mergedObject as T;
}

export { collectGettersAndActions, mergeObjectArray, deepMerge };

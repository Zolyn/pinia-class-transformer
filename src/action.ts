import { Func, MetaDataKeys } from './types';
import { ActionsTree } from 'pinia';

/**
 * Action装饰器
 *
 * @param target - 目标对象的构造函数
 * @param propertyKey - 被装饰属性的名称
 * @param descriptor - 被装饰属性的描述符
 *
 * @public
 */
export function Action(target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<Func>): void {
    const action: ActionsTree = Reflect.getMetadata(MetaDataKeys.Actions, target) ?? {};
    if (descriptor.value) {
        action[propertyKey] = descriptor.value;
    }

    Reflect.defineMetadata(MetaDataKeys.Actions, action, target);
}

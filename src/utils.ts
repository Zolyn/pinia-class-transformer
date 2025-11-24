export function getAllDescriptors(proto: object): Record<string, PropertyDescriptor> {
    const descriptors: Record<string, PropertyDescriptor> = {};
    let currentProto = proto;

    while (currentProto && currentProto !== Object.prototype) {
        const currentDescriptors = Object.getOwnPropertyDescriptors(currentProto);

        for (const key in currentDescriptors) {
            if (!descriptors[key]) {
                descriptors[key] = currentDescriptors[key];
            }
        }

        currentProto = Object.getPrototypeOf(currentProto);
    }
    
    return descriptors;
}

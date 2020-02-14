/**
 * Defer triggering method call
 * @param milliseconds
 */
export function debounce(milliseconds: number = 100) {
    return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
        const
            originalMethod = descriptor.value,
            instances = new WeakMap();

        descriptor.value = function (...args: any) {
            let pending = instances.get(this);
            if (pending != null) {
                if (pending[propertyKey]) {
                    clearTimeout(pending[propertyKey]);
                    pending[propertyKey] = null;
                }
            } else {
                pending = {};
                instances.set(this, pending);
            }
            pending[propertyKey] = setTimeout(() => (originalMethod.call(this, ...args), delete pending[propertyKey]), milliseconds)
        };
        return descriptor;
    }
}

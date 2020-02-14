import {EventEmitter} from "./events.js";

export function updater(event: string = 'changed') {
    return function (target: ObservableStore, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args: any) {
            if (originalMethod.call(this, ...args)) {
                (<ObservableStore>this).events.emit(event);
            }
        };
        return descriptor;
    }
}

export class ObservableStore {
    public events = new EventEmitter();
}

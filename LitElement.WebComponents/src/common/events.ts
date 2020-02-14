import {LitElement} from "web_modules/lit-element.js";

type EventHandler = (event?: string, ...params: any) => void;

export class EventEmitter extends Map {
    on(event: string, handler: EventHandler) {
        let handlers = this.get(event);
        if (handlers == null) {
            handlers = [];
            this.set(event, handlers);
        }
        handlers.push(handler);
    }

    off(event: string, handler: EventHandler) {
        const handlers = this.get(event);
        if (handlers != null) {
            const ix = handlers.findIndex((h : EventHandler) => h === handler);
            if (ix >= 0) {
                handlers.splice(ix, 1);
            }
            if (handlers.length === 0) {
                this.delete(event);
            }
        }
    }

    emit(event: string, ...params: any) {
        const handlers = this.get(event);
        if (handlers != null) {
            handlers.forEach((h: EventHandler) => h(event, ...params))
        }
    }
}

export function customEvent(event: string = '') {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args: any) {
            const detail = originalMethod.call(this, ...args);
            (<LitElement>this).dispatchEvent(new CustomEvent(event || propertyKey, {detail}));
        };
        return descriptor;
    }
}

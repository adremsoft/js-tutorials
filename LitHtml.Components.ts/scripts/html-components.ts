// @ts-ignore
import {html, render} from 'https://unpkg.com/lit-html@1.1.2/lit-html.js';
// @ts-ignore
import {repeat} from 'https://unpkg.com/lit-html@1.1.2/directives/repeat.js';

function isChildOf(c: any, p: HTMLElement) {
    do {
        c = c?.parentNode;
    } while (c !== p && c != null);
    return c != null;
}

export type EventHandler = (...params: any) => void;

export interface ComponentEvents {
    [handlers: string]: EventHandler | undefined
}

class BaseComponent {
    events: ComponentEvents = {};
    el: HTMLElement | null;

    constructor(events: any = {}) {
        this.events = events;
        this.el = null;
    }

    event(e: Event, name: string, ...params: any): void {
        if (this.events != null) {
            const handler = <EventHandler>this.events[name];
            if (typeof handler === 'function') {
                handler(...params);
            }
        }
        e.stopPropagation();
    }

    update() {
        const html = this.render();
        if (this.el != null && html != null) {
            render(html, this.el);
        }
    }

    render() {
    }
}

export {isChildOf, html, repeat, BaseComponent};

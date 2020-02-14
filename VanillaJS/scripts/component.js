export class Component {
    constructor(el, events) {
        this.el = el;
        this.events = events;
        const elements = Array.from(el.querySelectorAll('[bind]'));
        if (el.getAttribute('bind') != null) {
            elements.push(el);
        }
        this.bindEvents(elements, events);
    }

    get visible() {
        return !this.el.classList.contains('hidden');
    }

    set visible(state) {
        if (state) {
            this.el.classList.remove('hidden');
            this.el.scrollIntoView();
        } else {
            this.el.classList.add('hidden')
        }
    }

    bindEvents(elements, scope) {
        function getMethod(name, scopes) {
            const
                [scope, method] = scopes.map(s => [s, s[name]]).find(([s, m]) => m != null) || [];
            if (method != null) {
                return method.bind(scope);
            }
        }

        elements.forEach(e => {
            const
                [event, methodName] = e.getAttribute('bind').split(':'),
                method = getMethod(methodName, [scope, this]);

            if (typeof method === 'function') {
                e.addEventListener(event, method);
            } else {
                console.warn('missing binding for ', event, ' method: ', methodName);
            }
        });
    }
}

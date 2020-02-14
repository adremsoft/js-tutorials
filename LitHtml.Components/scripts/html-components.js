const {html, repeat, render} = window.polymer;

function isChildOf(c, p) {
    do {
        c = c.parentNode;
    } while (c !== p && c != null);
    return c != null;
}

class BaseComponent {
    constructor(events) {
        this.events = events;
        this.el = null;
    }

    event(e, name, ...params) {
        if (this.events != null && typeof this.events[name] === 'function') {
            this.events[name](...params);
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
        return html``;
    }
}

export {isChildOf, html, repeat, BaseComponent};

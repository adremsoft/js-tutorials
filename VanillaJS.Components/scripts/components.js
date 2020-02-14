function isChildOf(c, p) {
    do {
        c = c.parentNode;
    } while (c !== p && c != null);
    return c != null;
}

function html(tag = 'div', attr = null, children = []) {
    const el = document.createElement(tag);
    let value;
    Object.entries(attr || {}).forEach(([key, val]) => {
        if (key[0] === '$') { // listener
            el.addEventListener(key.substr(1), val);
        } else if (key[0] === '_') { // property
            // we need to add children first otherwise there are no options
            if (tag === 'select' && key === '_value') {
                value = val;
            } else {
                el[key.substr(1)] = val;
            }
        } else if (key === 'class') { // class
            el.classList.add(...val.split(' '));
        } else if (key === 'text') { // text content
            el.innerText = val;
        } else {
            el.setAttribute(key, val); // attribute
        }
    });

    children.forEach(c => el.appendChild(c));
    if (value != null) {
        el.value = value;
    }
    return el;
}

class BaseComponent {
    constructor(events) {
        this.events = events;
    }

    event(e, name, ...params) {
        if (this.events != null && typeof this.events[name] === 'function') {
            this.events[name](...params);
        }
        e.stopPropagation();
    }
}

export {isChildOf, html, BaseComponent};

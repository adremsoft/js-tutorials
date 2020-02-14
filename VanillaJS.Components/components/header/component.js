import {BaseComponent, html} from "../../scripts/components.js";

class HeaderComponent extends BaseComponent {
    constructor(parent, events) {
        super(events);
        this.render(parent);
    }

    render(parent) {
        this.el = parent.appendChild(html('header', null, [
            html('input', {type: 'search', placeholder: 'Search...', $input: (e) => this.event(e, 'onSearch', e.target.value)}),
            html('a', {href: '#', class: 'btn', text: 'Add Note', $click: (e) => this.event(e, 'onAdd')})
        ]));
    }
}

export {HeaderComponent};

import {BaseComponent, html} from "../../scripts/html-components.js";

class HeaderComponent extends BaseComponent {
    constructor(parent, events) {
        super(events);
        this.el = parent;
        this.update();
    }

    render() {
        // language=HTML
        return html`
            <header>
              <input type="search" placeholder="Search..." @input=${e => this.event(e, 'onSearch', e.target.value)}>
              <a href="#" class="btn" @click=${e => this.event(e, 'onAdd')}}>Add Note</a>
            </header>
        `;
    }
}

export {HeaderComponent};

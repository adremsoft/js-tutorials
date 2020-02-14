import {BaseComponent, ComponentEvents, EventHandler, html} from "../../scripts/html-components.js";

export interface HeaderEvents extends ComponentEvents {
    onSearch: EventHandler,
    onAdd: EventHandler
}

class HeaderComponent extends BaseComponent {
    constructor(parent: HTMLElement, events: HeaderEvents) {
        super(events);
        this.el = parent;
        this.update();
    }

    render() {
        // language=HTML
        return html`
            <header>
              <input type="search" placeholder="Search..." @input=${(e : InputEvent) => this.event(e, 'onSearch', (<any>e.target)?.value)}>
              <a href="#" class="btn" @click=${(e:Event) => this.event(e, 'onAdd')}}>Add Note</a>
            </header>
        `;
    }
}

export {HeaderComponent};

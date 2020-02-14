import {customElement, html, LitElement} from "lit-element";
import {debounce} from "../common/debounce.js";
import {customEvent} from "../common/events.js";
import {noShadowDOM} from "../common/dynamic-template.js";

@customElement('x-app-header')
@noShadowDOM
export class AppHeaderElement extends LitElement {
    @debounce(150)
    @customEvent()
    onSearch(e: any) {
        return {text: e.target.value}
    }

    @customEvent()
    onAdd(e: Event) {
        e.stopPropagation();
    }

    render() {
        // language=HTML
        return html`
        <header>
            <label for="search">
                <input type="search" id="search" placeholder="search" @input=${this.onSearch}>
            </label>
            <a href="#" class="btn" @click=${this.onAdd}>Add Note</a>
        </header>            
        `
    }
}

import {html} from "lit-html";
import {customElement, LitElement, property} from "lit-element";

import {editForm} from "./components/edit-form.js";
import {NoteList} from "./services/note-list.js";
// custom elements
import "./components/note-list-element.js";
import "./components/app-header-element.js";
import {withoutShadowDOM} from "./common/dynamic-template.js";

const
    isChildOf = (c: HTMLElement | null, p: HTMLElement | null) => {
        do {
            c = <HTMLElement | null>c?.parentNode;
        } while (c !== p && c != null);
        return c != null;
    };


@customElement('x-app')
@withoutShadowDOM
export class AppElement extends LitElement {
    @property({type: String}) searchText = '';
    notes: NoteList;

    constructor() {
        super();

        this.notes = new NoteList(JSON.parse(localStorage.getItem('notes') || '[]'));
        this.notes.events.on('changed', () => this.saveData());

        editForm.events.on('onUpdate', (ev, rec) => this.notes.update(rec));
        editForm.events.on('onDelete', (ev, id) => this.notes.delete(id));

        this.init();
    }

    onAddNote() {
        editForm.edit(this.notes.new());
    }

    onSearch(e: CustomEvent) {
        this.searchText = e.detail.text.toLowerCase();
    }

    static onEdit(e: CustomEvent) {
        editForm.edit(e.detail);
    }

    saveData() {
        localStorage.setItem('notes', JSON.stringify(this.notes.list));
    }

    init() {
        document.body.addEventListener('mousedown', (e: any) => {
            if (editForm.visible && e.target.id !== 'new-note' && !isChildOf(e.target, document.getElementById('new-note'))) {
                editForm.detach();
            }
        });
    }

    render() {
        // language=HTML
        return html`
           <x-app-header @onAdd=${this.onAddNote.bind(this)} @onSearch=${this.onSearch.bind(this)}></x-app-header>
           <x-notes .searchText=${this.searchText} .notes=${this.notes} @onChanged=${this.saveData.bind(this)} @onEdit=${AppElement.onEdit}></x-notes>`
    }
}

import {repeat} from "lit-html/directives/repeat";
import {customElement, html, LitElement, property} from "lit-element";
import {Note, NoteList} from "../services/note-list.js";
import {customEvent} from "../common/events.js";
import {withoutShadowDOM} from "../common/dynamic-template.js";

@customElement('x-note')
@withoutShadowDOM
class NoteElement extends LitElement {
    @property({type: Note}) note: Note | undefined;

    render() {
        const {category, subject, content} = this.note || {};
        return html`
              <h2>${subject}</h2>
              <h3>${category}</h3>
              <p>${content}</p>`
    }
}

@customElement('x-notes')
@withoutShadowDOM
class NoteListElement extends LitElement {
    private data: NoteList | null = null;

    @property({type: String}) searchText = '';

    @property({type: NoteList})
    get notes(): NoteList | null {
        return this.data;
    }

    set notes(value: NoteList | null) {
        if (this.data == null && value != null) {
            this.data = value;
            // @ts-ignore
            this.data.events.on('changed', () => this.update())
        }
    }

    @customEvent()
    onEdit(note: Note): Note {
        return note;
    }

    filter(note: Note): boolean {
        return this.searchText === '' || Object.values(note).filter(v => typeof v === 'string').some((s: string) => s.toLowerCase().includes(this.searchText));
    }

    render() {
        const notes = (this.data != null && this.searchText !== '' ? this.data.list.filter(n => this.filter(n)) : this.notes?.list) || [];
        // language=HTML
        return html`
          <div class="notes">
             ${repeat(notes, (n: Note) => n.id, (n: Note) => html`
                <x-note .note=${n} @click=${() => this.onEdit(n)} class=${n.category.toLowerCase()}></x-note>`)}                
          </div>`
    }
}

export {NoteListElement}

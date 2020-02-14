import {BaseComponent, ComponentEvents, EventHandler, html, isChildOf} from "../../scripts/html-components.js";
import {Note} from "../../notes/notes-list.js";

const bind = (obj: any, prop: string) => (e: any) => obj[prop] = e.target?.value;

export interface NoteFormEvents extends ComponentEvents {
    onSave: EventHandler,
    onDelete?: EventHandler
}

class NoteForm extends BaseComponent {
    note: Note | null = null;

    constructor() {
        super();
        document.body.addEventListener('mousedown', (e) => {
            if (this.el != null && e.target !== this.el && !isChildOf(e.target, this.el)) {
                this.close();
            }
        });
    }

    event(e: Event, name: string, ...params: any) {
        this.close();
        super.event(e, name, ...params);
    }

    update() {
        if (this.el == null) {
            this.el = document.body.appendChild(document.createElement('div'));
            this.el.setAttribute('id', 'new-note-form');
        }
        super.update();
        (<HTMLInputElement>this.el.querySelector('[focus]'))?.focus();
    }

    render() {
        const data = this.note;
        if (data == null) {
            return html``;
        }
        //language=HTML
        return html`
            <label>
                Subject:<input focus type="text" .value=${data.subject} @input=${bind(data, 'subject')}>
            </label>
            <label>
                Content:<textarea  .value=${data.content} @input=${bind(data, 'content')} ></textarea>
            </label>
            <label>
                Category: 
                <select .value=${data.category} @input=${bind(data, 'category')}>
                    <option>Important</option>
                    <option>Normal</option>
                    <option>Disabled</option>
                </select>
            </label>
            <a href="#" class="btn btn-save" @click=${(e: Event) => this.event(e, 'onSave', data)}>Save</a>
            <a href="#" class="btn-close" @click=${() => this.close()}>&times;</a>
            <a href="#" class="btn btn-delete" @click="${(e: Event) => this.event(e, 'onDelete', data)}">Delete</a>
        `;
    }

    close() {
        if (this.el != null) {
            this.el.remove();
            this.el = null;
        }
    }

    edit(note: Note, events: NoteFormEvents) {
        this.note = note;
        this.events = events;
        this.update();
    }
}

export const noteForm = new NoteForm();

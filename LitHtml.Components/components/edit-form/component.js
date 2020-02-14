import {BaseComponent, html, isChildOf} from "../../scripts/html-components.js";

const bind = (obj, prop) => (e) => obj[prop] = e.target.value;

class NoteForm extends BaseComponent {
    constructor() {
        super();
        document.body.addEventListener('click', (e) => {
            if (this.el != null && e.target !== this.el && !isChildOf(e.target, this.el)) {
                this.close();
            }
        });
    }

    event(e, name, ...params) {
        this.close();
        super.event(e, name, ...params);
    }

    update() {
        if (this.el == null) {
            this.el = document.body.appendChild(document.createElement('div'));
            this.el.setAttribute('id', 'new-note-form');
        }
        super.update();
        this.el.querySelector('[focus]').focus();
    }

    render() {
        const data = this.note;
        //language=HTML
        return html`
            <label>
                Subject:<input focus="true" type="text" .value=${data.subject} @input=${bind(data, 'subject')}>
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
            <a href="#" class="btn btn-save" @click=${(e) => this.event(e, 'onSave', data)}>Save</a>
            <a href="#" class="btn-close" @click=${() => this.close()}>&times;</a>
            <a href="#" class="btn btn-delete" @click="${(e) => this.event(e, 'onDelete', data)}">Delete</a>
        `;
    }

    close() {
        this.el.remove();
        this.el = undefined;
    }

    edit(note, events) {
        this.note = note;
        this.events = events;
        this.update();
    }
}

export const noteForm = new NoteForm();

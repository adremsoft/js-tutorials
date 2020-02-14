import {BaseComponent, html, isChildOf} from "../../scripts/components.js";

class NoteForm extends BaseComponent {
    constructor() {
        super();
        document.body.addEventListener('mousedown', (e) => {
            if (this.el != null && e.target !== this.el && !isChildOf(e.target, this.el)) {
                this.close();
            }
        });
    }

    get data() {
        return Object.assign(this.note, Object.fromEntries(Array.from(this.el.querySelectorAll('[name]').values()).map(e => ([e.getAttribute('name'), e.value]))));
    }

    event(e, name, ...params) {
        this.close();
        super.event(e, name, ...params);
    }

    render(note) {
        this.el = document.body.appendChild(html('div', {id: 'new-note-form'}));
        [
            html('label', {text: 'Subject:'}, [html('input', {name: 'subject', type: 'text',  focus: true, _value: note.subject})]),
            html('label', {text: 'Content:'}, [html('textarea', {name: 'content', type: 'text', _value: note.content})]),
            html('select', {text: 'Category:', name: 'category', _value: note.category}, [
                html('option', {text: 'Important'}),
                html('option', {text: 'Normal'}),
                html('option', {text: 'Disabled'})
            ]),
            html('a', {href: '#', text: 'Save', class: 'btn btn-save', $click: (e) => this.event(e, 'onSave', this.data)}),
            note.id !== -1 ? html('a', {href: '#', text: 'Delete', class: 'btn btn-delete', $click: (e) => this.event(e, 'onDelete', this.data)}) : null,
            html('a', {href: '#', _innerHTML: '&times;', class: 'btn-close', $click: () => this.close()}),
        ].filter(e => e != null).forEach(e => this.el.appendChild(e));
        this.el.querySelector('[focus]').focus();
    }

    close() {
        this.el.remove();
        this.el = undefined;
    }

    edit(note, events) {
        this.note = note;
        this.events = events;
        this.render(note);
    }
}

export const noteForm = new NoteForm();

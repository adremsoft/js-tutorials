import {Component} from "../scripts/component.js";

export class NoteForm extends Component {
    get note() {
        return Object.assign(this.data, Object.fromEntries(Array.from(this.el.querySelectorAll('[id]')).map(e => ([e.id, e.value]))));
    }

    set note(value) {
        this.data = value;
        this.el.querySelectorAll('[id]').forEach(e => e.value = value[e.id]);
    }

    ovClick(e) {
        if (e.target.classList.contains('overlay')) {
            this.visible = false;
        }
    }

    update() {
        this.visible = false;
        this.events.onUpdate(this.note);
    }

    hide() {
        this.visible = false;
    }

    delete() {
        this.events.onDelete(this.note);
        this.hide();
    }

    edit(note) {
        this.note = note;
        this.visible = true;
    }
}

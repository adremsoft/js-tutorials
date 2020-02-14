import {Component} from "../scripts/component.js";

export class NoteList extends Component {
    constructor(el, events) {
        super(el, events);
        this.notes = [];
        this.searchText = '';
        this.load().render();
    }

    get nextId() {
        this.lastId += 1;
        return this.lastId;
    }

    search(text) {
        this.searchText = text.toLowerCase();
        this.render();
    }

    findNoteIndex(id) {
        return this.notes.findIndex(n => n.id === id);
    }

    delete(id) {
        const ix = this.findNoteIndex(id);
        if (ix >= 0) {
            this.notes.splice(ix, 1)
        }
        this.save().render();
    }

    update(note) {
        const ix = note.id === -1 ? -1 : this.findNoteIndex(note.id);
        if (ix === -1) {
            this.notes.push(Object.assign(note, {id: this.nextId}));
        } else {
            this.notes[ix] = note;
        }
        this.save().render();
    }

    filter(note) {
        return Object.values(note).filter(v => typeof v === 'string').some(v => v.toLowerCase().includes(this.searchText))
    }

    edit(e) {
        let t = e.target;
        while (t.tagName !== 'LI') {
            t = t.parentElement;
        }
        const ix = parseInt(t.getAttribute('ix'), 10);
        this.events.onEdit(this.notes[ix]);
    }

    render() {
        const list = this.notes.filter(note => this.searchText === '' || this.filter(note));

        function li(n, ix) {
            return `
                <li class="${n.category.toLowerCase()}" ix="${ix}" bind="click:edit" >
                  <h2>${n.subject}</h2>
                  <h3>${n.category}</h3>                      
                  <p>${n.content}</p>                      
                </li>`
        }

        this.el.innerHTML = `${list.map((note, ix) => li(note, ix)).join('')}`;
        this.bindEvents(this.el.querySelectorAll('li[bind]'), this);
    }

    load() {
        this.notes = JSON.parse(localStorage.getItem('notes') || "[]");
        this.lastId = this.notes.reduce((pv, v) => v.id > pv ? v : pv, 0);
        return this;
    }

    save() {
        localStorage.setItem('notes', JSON.stringify(this.notes));
        return this;
    }
}

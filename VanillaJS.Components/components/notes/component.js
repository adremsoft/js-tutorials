import {BaseComponent, html} from "../../scripts/components.js";

const noteList = [];
let searchText = '';

class NotesComponent extends BaseComponent {
    constructor(events) {
        super(events);
        this.el = document.body.appendChild(html('ul', {class: 'notes'}));
        this.load().render();
    }

    get nextId() {
        this.lastId += 1;
        return this.lastId;
    }

    search(text) {
        searchText = text.toLowerCase();
        this.render();
    }

    new() {
        return Object.assign({}, {
            id : -1,
            subject: '',
            content: '',
            category: 'Normal'
        });
    }

    delete(note) {
        const ix = noteList.findIndex(n => n.id === note.id);
        if (ix >= 0) {
            noteList.splice(ix,1);
        }
        this.save().render();
    }

    update(note) {
        if (note.id === -1) {
            note.id = this.nextId;
            noteList.push(note);
        } else {
            const ix = noteList.findIndex(n => n.id === note.id);
            noteList[ix] = note;
        }
        this.save().render();
    }

    render() {
        this.el.innerHTML = '';
        noteList
            .filter(r => searchText === '' || Object.values(r).some(v => v.toLowerCase().includes(searchText)))
            .map(rec => html('li', {class: rec.category.toLowerCase(), $click: (e) => this.event(e, 'onEdit', rec)}, [
                html('h2', {text: rec.subject}),
                html('h3', {text: rec.category}),
                html('p', {text: rec.content})
            ])).forEach(li => this.el.append(li));
    }

    load() {
        noteList.length = 0;
        noteList.push(...JSON.parse(localStorage.getItem('notes')) || []);
        this.lastId = noteList.reduce((pv, v) => v.id > pv ? v.id : pv, 0);
        return this;
    }

    save() {
        localStorage.setItem('notes', JSON.stringify(noteList));
        return this;
    }
}

export {NotesComponent};

export class NoteList extends Array {
    constructor(events = {}) {
        super();
        this.events = events;
    }

    changed() {
        if (typeof this.events.onChanged === 'function') {
            this.events.onChanged(this);
        }
    }

    get nextId() {
        this.lastId += 1;
        return this.lastId;
    }

    new() {
        return Object.assign({}, {
            id: -1,
            subject: '',
            content: '',
            category: 'Normal'
        });
    }

    delete(note) {
        const ix = this.findIndex(n => n.id === note.id);
        if (ix >= 0) {
            this.splice(ix, 1);
        }
        this.changed();
    }

    update(note) {
        if (note.id === -1) {
            note.id = this.nextId;
            this.push(note);
        } else {
            const ix = this.findIndex(n => n.id === note.id);
            this[ix] = note;
        }
        this.changed();
    }

    load(data) {
        this.length = 0;
        this.push(...data);
        this.lastId = this.reduce((pv, v) => v.id > pv ? v.id : pv, 0);
    }
}

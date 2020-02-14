import {ObservableStore, updater} from "../common/observable-store.js";

class Note {
    id: number;
    subject = '';
    content = '';
    category = 'Normal';

    constructor(id : number) {
        this.id = id;
    }
}

class NoteList extends ObservableStore {
    private lastId = 0;
    public list: Array<Note>;

    constructor(data : []) {
        super();
        this.list = data;
        this.lastId = this.list.reduce((maxId, e) => e.id > maxId ? e.id : maxId, 0);
    }

    private get nextId() {
        this.lastId += 1;
        return this.lastId;
    }

    new() {
        return new Note(this.nextId);
    }

    @updater()
    update(rec: Note) {
        const ix = this.list.findIndex(r => r.id === rec.id);
        if (ix === -1) {
            this.list.push(rec);
        } else {
            this.list[ix] = Object.assign({}, rec);
        }
        return true;
    }

    @updater()
    delete(id: number) {
        const ix = this.list.findIndex(rec => rec.id === id);
        if (ix >= 0) {
            this.list.splice(ix, 1);
            return true;
        }
    }
}

export {Note, NoteList};

export class NotesLocalStore {
    constructor(key = 'notes') {
        this.key = key;
    }

    load(noteList) {
        noteList.load(JSON.parse(localStorage.getItem(this.key)) || []);
    }

    save(noteList) {
        localStorage.setItem(this.key, JSON.stringify(noteList));
    }
}

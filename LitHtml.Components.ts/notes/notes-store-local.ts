import {NoteList} from "./notes-list.js";

export class NotesLocalStore {
    key: string;

    constructor(key = 'notes') {
        this.key = key;
    }

    load(noteList: NoteList) {
        const data = localStorage.getItem(this.key) || "[]";
        noteList.load(JSON.parse(data));
    }

    save(noteList: NoteList) {
        localStorage.setItem(this.key, JSON.stringify(noteList));
    }
}

import {ObservableListElement, ListEvents, ObservableList} from "./observable-list.js";

export class Note extends ObservableListElement{
    subject = '';
    content = '';
    category = 'Normal'
}

export class NoteList extends ObservableList<Note>  {
    new() {
        return new Note();
    }
}

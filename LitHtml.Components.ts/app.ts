import {HeaderComponent} from "./components/header/component.js";
import {NoteListComponent} from "./components/note-list/component.js";

import {Note, NoteList} from "./notes/notes-list.js";

import {noteForm} from "./components/edit-form/component.js";
import {NotesLocalStore} from "./notes/notes-store-local.js";

const
    store = new NotesLocalStore('notes'),
    notes = new NoteList({
        onChanged() {
            store.save(notes);
            notesView.update();
        }
    }),

    header = new HeaderComponent(document.body, {
        onSearch(text) {
            notesView.search(text);
        },
        onAdd() {
            noteForm.edit(notes.new(), {
                onSave(note: Note) {
                    notes.update(note);
                }
            });
        }
    }),

    notesView = new NoteListComponent(notes, {
        onEdit(note : Note) {
            noteForm.edit(note, {
                onSave(note) {
                    notes.update(note);
                },
                onDelete(note) {
                    notes.delete(note);
                }
            });
        }
    });

store.load(notes);
notesView.update();

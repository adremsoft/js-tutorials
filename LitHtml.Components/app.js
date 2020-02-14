import {HeaderComponent} from "./components/header/component.js";
import {NotesComponent} from "./components/notes/component.js";

import {NoteList} from "./scripts/notes-list.js";

import {noteForm} from "./components/edit-form/component.js";
import {NotesLocalStore} from "./scripts/notes-store-local.js";

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
                onSave(note) {
                    notes.update(note);
                }
            });
        }
    }),

    notesView = new NotesComponent(notes, {
        onEdit(note) {
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

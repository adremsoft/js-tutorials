import {Component} from "./scripts/component.js";
import {NoteForm} from "./views/notes-form.js";
import {NoteList} from "./views/note-list.js";

const
    header = new Component(document.querySelector('body > header'), {
        onSearch(e) {
            notes.search(e.target.value.toLowerCase());
        },

        onAdd() {
            noteForm.edit({
                subject: '',
                content: '',
                category: 'Normal'
            })
        }
    }),

    noteForm = new NoteForm(document.getElementById('new-note'), {
        onUpdate(note) {
            notes.update(note);
        },

        onDelete(note) {
            notes.delete(note.id);
        }
    }),

    notes = new NoteList(document.getElementById('notes'), {
        onEdit(note) {
            noteForm.edit(note);
        }
    });

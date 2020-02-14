import {HeaderComponent} from "./components/header/component.js";
import {NotesComponent} from "./components/notes/component.js";
import {noteForm} from "./components/edit-form/component.js";

const
    header = new HeaderComponent(document.body, {
        onSearch(text) {
            notes.search(text);
        },
        onAdd() {
            noteForm.edit(notes.new(), {
                onSave(note) {
                    notes.update(note);
                }

            });
        }
    }),

    notes = new NotesComponent({
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

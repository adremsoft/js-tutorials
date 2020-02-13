(function () {
    "use strict";

    angular.module('app.services')
        .service('NoteList', function () {
            return class NoteList extends Array {
                get nextId() {
                    this.lastId += 1;
                    return this.lastId;
                }

                new() {
                    return {
                        id: -1,
                        subject: '',
                        content: '',
                        category: 'Normal'
                    }
                }

                findNoteIndex(id) {
                    return this.findIndex(note => note.id === id);
                }

                delete(id) {
                    const ix = this.findNoteIndex(id);
                    this.splice(ix, 1);
                }

                update(note) {
                    const ix = note.id === -1 ? -1 : this.findNoteIndex(note.id);
                    if (ix === -1) {
                        this.push(Object.assign(note, {id: this.nextId}));
                    } else {
                        this[ix] = note;
                    }
                }

                load(data) {
                    this.length = 0;
                    this.push(...data);
                    this.lastId = this.reduce((pv, v) => v.id > pv ? v.id : pv, 0);
                }
            }
        })

        .service('localNoteStore', function () {
            return {
                save(notes) {
                    localStorage.setItem('notes', JSON.stringify(notes));
                },
                load(notes) {
                    notes.load(JSON.parse(localStorage.getItem('notes') || "[]"));
                }
            }
        })
})();

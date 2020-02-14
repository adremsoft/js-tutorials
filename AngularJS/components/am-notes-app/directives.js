/* global angular, $ */
(function () {
    "use strict";

    angular.module("app.directives")
        .component("amNotesApp", {
            // language=HTML
            template: `
                <am-notes-form note="note" on-delete="$ctrl.onDelete(note)" on-update="$ctrl.onUpdate(note)"></am-notes-form>
                <header>
                    <label for="search">
                        <input type="search" ng-model="$ctrl.search" placeholder="Search..." ng-model-options="{ debounce : 150 }">
                    </label>
                    <a href="" class="btn" ng-click="$ctrl.add($event)">Add Note</a>
                </header>

                <am-notes-list search="$ctrl.search" notes="$ctrl.notes" on-edit="$ctrl.edit($event,note)"></am-notes-list>`,
            controller: class {
                constructor($scope, localNoteStore, NoteList) {
                    this.search = '';
                    this.notes = new NoteList();
                    this.$scope = $scope;
                    this.store = localNoteStore;
                }

                add($event) {
                    $event.stopPropagation();
                    this.$scope.$broadcast('note:edit', this.notes.new());
                }

                edit($event, note) {
                    $event.stopPropagation();
                    this.$scope.$broadcast('note:edit', Object.assign({}, note));
                }

                onUpdate(note) {
                    this.notes.update(note);
                    this.store.save(this.notes);
                }

                onDelete(note) {
                    this.notes.delete(note.id)
                }

                $onInit() {
                    this.store.load(this.notes);
                }
            }
        });
})();

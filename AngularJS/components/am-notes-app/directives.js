/* global angular, $ */
(function () {
    "use strict";

    angular.module("app.directives")

        .directive("amNotesApp", function (localNoteStore, NoteList) {
            return {
                // language=HTML
                template: `
                    <am-notes-form note="note" on-delete="onDelete(note)" on-update="onUpdate(note)"></am-notes-form>
                    <header>
                        <label for="search">
                            <input type="search" ng-model="search" placeholder="Search..." ng-model-options="{ debounce : 150 }">
                        </label>
                        <a href="" class="btn" ng-click="add($event)">Add Note</a>
                    </header>

                    <am-notes-list search="search" notes="notes" on-edit="edit($event,note)"></am-notes-list>`,
                controller($scope) {
                    Object.assign($scope, {
                        search: '',
                        notes: new NoteList(),
                        add($event) {
                            $event.stopPropagation();
                            $scope.$broadcast('note:edit', $scope.notes.new());
                        },
                        edit($event, note) {
                            $event.stopPropagation();
                            $scope.$broadcast('note:edit', Object.assign({},note));
                        },
                        onUpdate: (note) => {
                            $scope.notes.update(note);
                            localNoteStore.save($scope.notes);
                        },
                        onDelete: (note) => $scope.notes.delete(note.id)
                    });
                    localNoteStore.load($scope.notes);
                }
            };
        });
})();

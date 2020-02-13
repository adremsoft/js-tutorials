/* global angular, $ */
(function () {
    "use strict";

    angular.module("app.directives")
        .directive("amNotesItem", function () {
            return {
                scope: {
                    note: '<amNotesItem'
                },
                // language=HTML
                template: `
                    <h2>{{note.subject}}</h2>
                    <h3>{{note.category}}</h3>
                    <p>{{note.content}}</p>`
            };
        })

        .directive("amNotesList", function () {
            return {
                scope: {
                    notes: '<',
                    search: '<',
                    onEdit: '&'
                },
                // language=HTML
                template: `
                    <ul>
                        <li ng-repeat="note in notes | filter:search.toLowerCase() track by $index"
                            am-notes-item="note"
                            ng-click="onEdit({$event,note})"
                            class="{{note.category.toLowerCase()}}">
                        </li>
                    </ul>`
            };
        })
})();

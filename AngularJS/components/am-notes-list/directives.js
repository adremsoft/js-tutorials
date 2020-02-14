/* global angular, $ */
(function () {
    "use strict";

    angular.module("app.directives")
        // A directive renders inside of existing element so this one
        // should be used only as attribute
        .directive("amNotesItem", function () {
            return {
                restrict :'A',
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

        // The component mast be used as a tag (similar to custom component
        .component("amNotesList", {
            bindings: {
                notes: '<',
                search: '<',
                onEdit: '&'
            },
            // language=HTML
            template: `
                <ul>
                    <li ng-repeat="note in $ctrl.notes | filter:$ctrl.search.toLowerCase() track by $index"
                        am-notes-item="note"
                        ng-click="$ctrl.onEdit({$event,note})"
                        class="{{note.category.toLowerCase()}}">
                        {{note}}
                    </li>
                </ul>`
        })
})();

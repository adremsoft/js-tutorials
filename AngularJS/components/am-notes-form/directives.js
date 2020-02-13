/* global angular, $ */
(function () {
    "use strict";

    angular.module("app.directives")

        // very small directive select focun on the element after initialization
        .directive("ngFocus", function () {
            return function (scope, el) {
                el[0].focus();
            }
        })

        // This is new style component, where the controller is a class (a class is just a function)
        // it's simplified version of a directive definition it does not allow accessing element (no link function)
        .component("amNotesForm", {
            bindings: {
                onDelete: '&',
                onUpdate: '&'
            },
            // language=HTML
            template: `
                <div ng-if="$ctrl.show" ng-mousedown="$ctrl.ovClick($event)" class="overlay">
                    <div class="form">
                        <label for="subject">
                            Subject:
                            <input ng-focus="true" type="text" id="subject" ng-model="$ctrl.note.subject">
                        </label>
                        <label for="content">
                            Content:
                            <textarea id="content" ng-model="$ctrl.note.content"></textarea>
                        </label>
                        <label for="content">
                            Category:
                            <select id="category" ng-model="$ctrl.note.category">
                                <option>Important</option>
                                <option>Normal</option>
                                <option>Disabled</option>
                            </select>
                        </label>
                        <a href="" class="btn btn-update" ng-click="$ctrl.update()">Update</a>
                        <a href="" ng-if="note.id != -1" class="btn btn-delete" ng-click="$ctrl.delete()">Delete</a>
                        <a href="" class="btn-close" ng-click="$ctrl.show = false">&times;</a>
                    </div>
                </div>`,
            controller: class {
                constructor($scope) {
                    this.show = false;
                    $scope.$on('note:edit', (e, note) => this.edit(note));
                }

                ovClick($event) {
                    if ($event.target.classList.contains('overlay')) {
                        this.show = false;
                    }
                }

                update() {
                    this.onUpdate({note: this.note});
                    this.show = false;
                }

                delete() {
                    this.onDelete({note: this.note});
                    this.show = false;
                }

                edit(note) {
                    this.note = note;
                    this.show = true
                }
            }
        })
})();

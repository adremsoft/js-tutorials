/* global angular, $ */

(function () {
    "use strict";

    /**
     * NOTE:
     *
     *   Datalists are not working well with angularJS change detection when editing in-line
     *   like in this example.
     *   Usually, data records used for some grid component or edited
     *   in the form
     *
     *   - be  careful using frequent commit() because if we issue it twice we can add records twice
     *   - when editing we usually open datalist at the beginning and then commit all changes at once at the end
     *
     */

    angular.module("app.directives")
        .directive("amTodoItem", function () {
            return {
                scope: {
                    rec: '<amTodoItem',
                    onChanged: '&',
                    onDelete: '&'
                },
                // language=HTML
                template: `
                    <input type="checkbox" ng-model="rec.values.done">
                    {{rec.values.task}} &nbsp; <em>(Id:{{rec.values.id}})</em>
                    <a href="" class="btn btn-delete" ng-click="onDelete({key:rec.values.id})">Delete</a>
                `,
                controller($scope) {
                    // We can't observe rec.values as this property which is not an object as it looks and can't be copied
                    // but getValues() return regular object which is comparable by angular
                    $scope.$watch('rec.getValues()', (rec, prev) => {
                        // eliminate first call when scope is initialized
                        if (rec != null && prev != null && rec !== prev) {
                            $scope.onChanged();
                        }
                    }, true);
                }
            }
        })

        .component("amTodo", {
            // language=HTML
            template: `
                <h4>Data List</h4>
                <p class="desc">
                    This is not the best usage example - we use it mostly to read data from server not to update it.
                    Anyway, updating is possible and easy</p>
                <div class="controls">
                    <input type="text" class="form-control" ng-model="$ctrl.text" ng-model-options="{debounce : 150}">
                    <a href="" class="btn btn-primary btn-sm" ng-class="{ disabled : $ctrl.text === ''}" ng-click="$ctrl.add()">Add</a>
                </div>
                <ul>
                    <li ng-repeat="rec in $ctrl.data track by rec.lid"
                        am-todo-item="rec"
                        on-delete="$ctrl.delete(key)"
                        on-changed="$ctrl.update()"></li>
                </ul>
            `,
            controller: class {
                constructor($scope, $timeout, todoListData) {
                    this.text = '';
                    this.todoListData = todoListData;
                    this.data = this.todoListData.data;
                    $scope.$on('todo.changed', () => $timeout(() => {
                        // angular will refresh the view automatically
                    }, 0));
                }

                add() {
                    this.todoListData.addNewRecord(this.text);
                    this.text = '';
                }

                update() {
                    this.todoListData.update();
                }

                delete(key) {
                    this.todoListData.delete(key);
                }
            }
        });
})();


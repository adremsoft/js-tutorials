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
     *   - when editing we open datalist open and then commit all changes at once
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
                    <input type="checkbox" ng-model="data.done">
                    {{data.task}}
                    <a href="" class="btn btn-delete" ng-click="onDelete({rec})">Delete</a>
                `,
                controller($scope) {
                    // We can't observe rec.values as this kind of proxy not compatible with $watch
                    // so let's get local copy
                    $scope.$watch('rec', (rec) => {
                        if (rec) {
                            $scope.data = rec.getValues();
                        }
                    });
                    // update actual data record
                    $scope.$watch('data', rec => {
                        if (rec != null) {
                            let changed = false;
                            Object.entries(rec).filter(([k]) => k !== 'id').forEach(([k, v]) => {
                                if ($scope.rec.values[k] !== v) {
                                    $scope.rec.values[k] = v;
                                    changed = true;
                                }
                            });
                            if (changed) {
                                $scope.onChanged();
                            }
                        }
                    }, true)
                }
            }
        })

        .component("amTodo", {
            // language=HTML
            template: `
                <h4>Data List</h4>
                <div class="controls">
                    <input type="text" class="form-control" ng-model="$ctrl.text" ng-model-options="{debounce : 150}">
                    <a href="" class="btn btn-primary btn-sm" ng-class="{ disabled : $ctrl.text === ''}" ng-click="$ctrl.add()">Add</a>
                </div>
                <ul>
                    <li ng-repeat="rec in $ctrl.dataList.data track by rec.lid"
                        am-todo-item="rec"
                        on-delete="$ctrl.delete(rec)"
                        on-changed="$ctrl.update()"></li>
                </ul>
            `,
            controller: class {
                constructor($scope, $timeout) {
                    this.dataList = new adrem.RemoteDataListStore('srv', 250); // do not refresh often than every 250ms
                    this.dataList.on('changed', () => $timeout(() => void 0, 0));       // refresh view
                    this.dataList.open('TodoList', '', (res) => console.log('Opened and read: ', res.length));
                    this.text = '';
                }

                add() {
                    this.dataList.add({done: false, task: this.text});
                    this.dataList.commit();
                }

                update() {
                    this.dataList.commit();
                }

                delete(rec) {
                    this.dataList.delByKey(rec.values.id);
                    this.dataList.commit();
                }

                $onDestroy() {
                    // this will close datalist and cleanup remote instance
                    // we can't rely on GC
                    this.dataList.destroy();
                }
            }
        });
})();

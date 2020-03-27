/* global angular, $ */
(function () {
    "use strict";

    angular.module("app.directives")
        .component("amTextFile", {
            // language=HTML
            template: `
                <h4>Text File</h4>
                <select ng-options="name for name in $ctrl.files" class="form-control" ng-model="$ctrl.fileName"></select>
                <ul>
                    <li ng-repeat="rec in $ctrl.data track by rec.lid">{{rec.values.line}}</li>
                </ul>
            `,
            controller: class {
                files = [
                    "info.txt",
                    "test.txt"
                ];

                constructor($scope, $timeout, TextFileData) {
                    this.TextFileData = TextFileData;
                    this.data = TextFileData.data;
                    $scope.$on('textFile.changed', () => $timeout(() => {
                        // angular will refresh the view automatically
                    }, 0));
                    this.fileName = this.files[0];
                }

                get fileName() {
                    return this._file
                }

                set fileName(value) {
                    this.TextFileData.view(value);
                    this._file = value;
                }
            }
        });
})();

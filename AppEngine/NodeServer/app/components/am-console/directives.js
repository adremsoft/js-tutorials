/* global angular, $ */
(function () {
    "use strict";

    angular.module("app.directives")
        .component("amConsole", {
            template: `
                  <h4>Live Report</h4>
                  <p class="desc">This datalist publishes last 5 console messages from the server.</p>
                  <ul>
                     <li ng-repeat="rec in $ctrl.dataList.data track by rec.values.Id">{{::rec.values.message}}</li>
                  </ul>
                `,
            controller: class {
                constructor($scope) {
                    this.dataList = new adrem.RemoteDataListStore('srv', 250); // do not refresh faster than 250ms
                    this.dataList.on('changed', () => $scope.$digest());
                    this.dataList.open('ConsoleLog', '', (res) => console.log('Opened:', res));
                }

                $onDestroy() {
                    this.dataList.finalize();
                    this.dataList.destroy();
                }
            }
        });
})();

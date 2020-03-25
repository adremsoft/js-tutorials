/* global angular, $ */
(function () {
    "use strict";

    angular.module("app.directives")
        .component("amConsole", {
            // language=HTML
            template: `
                <h4>Live Report</h4>
                <p class="desc">This live report publishes last 5 console messages from the server.</p>
                <ul>
                    <li ng-repeat="rec in $ctrl.dataList.data track by rec.values.Id">{{::rec.values.message}}</li>
                </ul>
            `,
            controller: class {
                constructor($scope) {
                    this.dataList = new adrem.RemoteDataListStore('srv', 250); // do not refresh often than every 250ms
                    this.dataList.on('changed', () => $scope.$digest());       // refresh view
                    this.dataList.open('ConsoleLog', '', (res) => console.log('Opened and read: ', res.length));
                }

                $onDestroy() {
                    // this will close datalist and cleanup remote instance
                    // we can't rely on GC
                    this.dataList.destroy();
                }
            }
        });
})();

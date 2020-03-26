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
                    <li ng-repeat="rec in $ctrl.data track by rec.values.Id">{{::rec.values.message}}</li>
                </ul>
            `,
            controller: class {
                constructor($scope, consoleLogData) {
                    this.consoleLogData = consoleLogData;
                    this.refreshHandler = () => $scope.$digest();
                    this.consoleLogData.on('changed', this.refreshHandler);
                    this.data = consoleLogData.data;
                }

                $onDestroy() {
                    this.consoleLogData.off('changed', this.refreshHandler);
                }
            }
        });
})();

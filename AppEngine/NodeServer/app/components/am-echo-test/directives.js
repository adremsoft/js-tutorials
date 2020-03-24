/* global adrem, angular, $ */
(function () {
    "use strict";

    angular.module("app.directives")
        .component("amEchoTest", {
            // language=HTML
            template: `
                <h4>Echo service</h4>
                <label>
                    Enter message: <input type="text" class="form-control" ng-model="$ctrl.msg" ng-model-options="{ debounce : 150}">
                </label>

                <div>
                    Echo:
                    <p>
                        {{$ctrl.echoMessage}}
                    </p>
                </div>
            `,

            controller: class {
                constructor($scope) {
                    this.$scope = $scope;
                    $scope.$watch('$ctrl.msg', (msg) => msg != null ? this.sendMessage(msg) : null);
                }

                sendMessage(msg) {
                    // just call remote service IEcho from adrem.srv API
                    adrem.srv.IEcho.echo(msg, response => this.$scope.$apply(() => this.echoMessage = response));
                }
            }
        });
})();

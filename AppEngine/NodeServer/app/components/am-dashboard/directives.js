/* global angular, $ */
(function () {
    "use strict";

    angular.module("app.directives")
        .component("amDashboard", {
            // language=HTML
            template: `
                <h4>Data Tree</h4>
                <p class="desc">
                    DataTree is intended for publishing live dashboards. It key-value tree of data.
                    You can attach each component to a node and receive value as a sub-tree.
                    Single tree element can be
                </p>
                <div>

                </div>
            `,
            controller: class {
                constructor($scope) {
                    this.tree = new adrem.RemoteDataListTree('srv', 'dashboard');
                    console.log(' tree is ', this.tree);
                    this.data = {};
                    //this.timerData = this.tree.def('timer', 'timer', this.data)
                    this.tree.query({
                        path : 'timer',
                        type: 'timer',
                        query: {
                            command: 'start', interval: 1000
                        }
                    }, (r) => console.log(r))
                }

                $onDestroy() {
                    //
                }
            }
        });
})();

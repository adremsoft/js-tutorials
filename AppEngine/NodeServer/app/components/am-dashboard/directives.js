/* global angular, $ */
(function () {
    "use strict";

    angular.module("app.directives")

        // Create widgets and pass data node to it
        // This widget starts after sending empty query
        .component('amProcessor', {
            bindings: {
                data: '<'
            },
            template: `{{$ctrl.data.value}}`,
            controller: class {
                constructor($scope) {
                    this.$scope = $scope;
                }

                $onInit() {
                    this.data.on('changed', () => this.$scope.$apply());
                    this.data.query();
                }
            },
        })

        // Timer returns current time every second it can be started or stopped using query
        .component('amTimer', {
            bindings: {
                data: '<'
            },
            // language=HTML
            template: `
                <p ng-class="{active:$ctrl.data.enabled}">{{$ctrl.data.value}}</p>
                <button ng-click="$ctrl.toggleTimer()">{{ $ctrl.data.enabled ? 'Stop Timer' : 'Start Timer'}}</button>
            `,
            controller: class {
                constructor($scope) {
                    this.$scope = $scope;
                }

                toggleTimer() {
                    this.data.query({
                        command: this.data.enabled ? 'stop' : 'start'
                    });
                    this.data.enabled = !this.data.enabled;
                }

                $onInit() {
                    this.data.on('changed', () => this.$scope.$apply());
                }
            },
        })

        // create tree
        .component("amDashboard", {
            // language=HTML
            template: `
                <h4>Data Tree</h4>
                <p class="desc">
                    DataTree is intended for publishing live dashboards. It key-value tree of data.
                    You can attach each component to a node and receive value as a sub-tree.
                    Single tree element can be
                </p>
                <section>
                    <h5>Timer</h5>
                    <am-timer data="$ctrl.timerData"></am-timer>
                </section>

                <section>
                    <h5>Node Server Processor Utilization</h5>
                    <am-processor data="$ctrl.processorData"></am-processor>
                </section>
            `,
            controller: class {
                constructor(dashboardData) {
                    this.timerData = dashboardData.data('timer');
                    this.timerData.enabled = false;
                    this.processorData = dashboardData.data('processor');
                }
            }
        });
})();

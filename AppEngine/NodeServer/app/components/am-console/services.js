/* global angular, $ */
(function () {
    "use strict";

    angular.module("app.services")
        .service("consoleLogData", function () {
            const
                dataList = new adrem.RemoteDataListStore('srv', 250);

            dataList.open('ConsoleLog', '');
            return {
                dataList,
                on(e, handler, scope) {
                    this.dataList.on(e, handler, scope);
                },
                off(e, handler, scope) {
                    this.dataList.un(e, handler, scope);
                },
                data: dataList.data
            };
        });

})();

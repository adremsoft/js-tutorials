/* global angular, $ */
(function () {
    "use strict";

    angular.module("app.services")
        .service("TextFileData", function ($rootScope) {
            const
                dataList = new adrem.RemoteDataListStore('srv', 250); // do not refresh often than every 250ms

            // We use angular to broadcast messages about changes
            dataList.on('changed', () => $rootScope.$broadcast('textFile.changed'));
            return {
                dataList,
                data: dataList.data,
                view(fileName) {
                    this.dataList.open('TextFile:' + JSON.stringify({fileName}), '')
                }
            };
        });
})();

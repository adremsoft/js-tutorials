/* global angular, $ */
(function () {
    "use strict";

    angular.module("app.services")
        .service("dashboardData", function () {
            return new adrem.RemoteDataListTree('srv', 'dashboard');
        });

})();

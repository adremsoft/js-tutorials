(function () {
    "use strict";

    angular.module("app.controllers")
        .controller("appCtrl", function ($scope) {

            adrem.Client.start(() => {
                $scope.$apply(() => {
                    $scope.initialized = true
                })
            });


        })
})();

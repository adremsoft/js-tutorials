/* global angular, $ */
(function () {
    "use strict";

    angular.module('app.directives', []);
    angular.module('app.services', []);

    angular.module('app', [
        'app.services',
        'app.directives'
    ])
        .config(function ($compileProvider) {
            'use strict';
            $compileProvider.imgSrcSanitizationWhitelist(/img:|http:|https:/);
        });
})();

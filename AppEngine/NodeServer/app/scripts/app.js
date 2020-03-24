/* global angular */
angular.module('common.directives', []);
angular.module('common.services', []);
angular.module('app.directives', ['app.services']);
angular.module('app.controllers', []);
angular.module('app.services', ['common.services']);
angular.module('app.filters', ['app.services']);
angular.module('app.resources', []);

angular.module('app', [
    'app.resources',
    'app.controllers',
    'app.services',
    'app.directives',
    'app.filters',
    'common.services',
    'common.directives'
])
    .config(function ($compileProvider) {
        'use strict';
        $compileProvider.imgSrcSanitizationWhitelist(/img:|http:|https:/);
    });



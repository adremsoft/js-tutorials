/***************************************************************
 *
 *  Author   : Tomasz Kunicki
 *  Created  : 3/4/2020
 *
 * No part of this file may be duplicated, revised, translated,
 * localized or modified in any manner or compiled, linked or
 * uploaded or downloaded to or from any computer system without
 * the prior written consent of AdRem Software sp z o.o.
 *
 * 2020 Copyright Tomasz Kunicki, all rights reserved
 * 2020 Copyright AdRem Software, all rights reserved
 ****************************************************************/
/* global angular, $ */
(function () {
    "use strict";

    angular.module("app.directives")
        .directive("amWelcomeApp", function (nodeBackend) {
            return {
                restrict: 'E',
                scope: true,
                // language=HTML
                template: `
                    <h2>Welcome to app engine app</h2>
                    <div dx-button="{
                                text: 'Ask NodeJs',
                                type: 'default',
                                width: 120,
                                onClick: getText
                            }"></div>
                    <h3>{{text}}</h3>`,
                controller($scope) {
                    Object.assign($scope, {
                        async getText() {
                            // get async response
                            this.text = await nodeBackend.getText();
                            // force update view
                            this.$digest();
                        }
                    })
                }
            }
        });
})();

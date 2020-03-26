/***************************************************************
 *
 *  Author   : Tomasz Kunicki
 *  Created  : 3/26/2020
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

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
        .service("todoListData", function ($rootScope) {
            const
                dataList = new adrem.RemoteDataListStore('srv', 250); // do not refresh often than every 250ms

            dataList.open('TodoList', '', (res) => console.log('Opened and read: ', res.length));

            // We use angular to broadcast messages about changes
            dataList.on('changed', () => $rootScope.$broadcast('todo.changed'));

            return {
                dataList,
                data: dataList.data,
                addNewRecord(text) {
                    this.dataList.add({done: false, task: text});
                    this.dataList.commit();
                },

                update() {
                    this.dataList.commit();
                },

                delete(key) {
                    this.dataList.delByKey(key);
                    this.dataList.commit();
                }

            };
        });

})();

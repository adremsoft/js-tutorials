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

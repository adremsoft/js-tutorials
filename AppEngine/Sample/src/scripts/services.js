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
/* global angular, adrem */
(function () {
    "use strict";

    angular.module("app.services")
        .service("nodeBackend", function (shellService) {
            let node = null;
            
            shellService.ready.then(() => {
                node = new adrem.ExternalRequester('c:\\program files\\nodejs\\node.exe plugin/index.js --inspect', {}, {});
            });

            return {
                getText() {
                    return node.request('getText', {}, {}, 0, 5000)
                }
            };
        })

        .service('shellService', function () {
            return new class ShellService {
                constructor() {
                    this.events = new adrem.EventManager();
                    this.ready = new Promise(resolve => adrem.Client.start(() => resolve(adrem)));
                    this.ready.then(() => this.shell = adrem.app.IShellServices)
                }

                getVersion() {
                    return this.ready.then(() => new Promise(resolve => this.shell.getVersion(resolve)));
                }

                openBrowser(url) {
                    return this.ready.then(() => this.shell.openBrowser(url));
                }
            }();
        })

})();

/***************************************************************
 *
 *  Author   : Tomasz Kunicki
 *  Created  : 10/03/2019
 *
 * No part of this file may be duplicated, revised, translated,
 * localized or modified in any manner or compiled, linked or
 * uploaded or downloaded to or from any computer system without
 * the prior written consent of AdRem Software sp z o.o.
 *
 * 2019 Copyright Tomasz Kunicki, all rights reserved
 * 2019 Copyright AdRem Software, all rights reserved
 ****************************************************************/
/* global adrem */
(function () {
    "use strict";

    const
        DEFAULT_TIMEOUT = 2 * 60 * 1000;  // 2 min.

    class ExternalRequester {
        constructor(fileName, params = [], options = null) {
            this.fileName = fileName;
            this.params = params;
            this.options = Object.assign({}, options);
            this.requester = null;
            this.requestEvents = new adrem.EventManager();
            this.objects = new Map();
            this.runCount = 0;
            this.requestId = 0;
        }

        get connected() {
            if (this.requester == null) {
                this.initRequester();
            }
            return this.requester != null && this.requester.connected;
        }

        handleRequesterEvent(e) {
            if (e.eventid === 1) {
                if (e.data.event === 'started') {
                    this.requestEvents.fireEvent('started', {count: ++this.runCount});
                } else if (e.data.event === 'event') {
                    const data = e.data.data;
                    if (data.requestId != null) {
                        this.requestEvents.fireEvent(data.requestId.toString(), data);
                    } else if (data.request != null) {
                        this.dispatchRequest(data);
                    } else if (data.eventId != null) {
                        this.requestEvents.fireEvent(data.eventId, data);
                    }
                }
            }
        }

        initRequester() {
            // setup events before
            console.log('initializing requester', this);
            this.options.autoStart = false;
            this.requester = new adrem.app.IRequester({file: this.fileName, $params: this.params, options: this.options});
            adrem.Client.on(this.requester.id, this.handleRequesterEvent, this);
            this.requester.startProcess(() => console.log);
        }

        reinit() {
            this.requestId = 0;
            adrem.Client.un(this.requester.id, this.handleRequesterEvent);
            this.requester.destroy();
            delete this.requester;
        }

        dispatchRequest(req) {
            const method = req.method.split('.'), obj = this.objects.get(method[0]);
            let result;
            if (obj != null) {
                const func = obj[method[1]];
                if (func != null && typeof func === 'function') {
                    result = func.call(obj, req.data);
                } else {
                    console.warn('Invalid method or interface request ', req.method);
                }
            } else {
                console.warn('Invalid method or interface request ', req.method);
            }
            if (req.request !== 0) {
                Promise.resolve(result).then(response => {
                    ++this.requestId;
                    this.requester.request('@@resp', {id: req.request, response}, 0, 5000);
                });
            }
        }

        // Allow receiving remote calls through registered interfaces
        /**
         *
         * @param {string} name
         * @param {object} obj
         */
        registerRemoteInterface(name, obj) {
            this.objects.set(name, obj);
        }

        sendInterfaceEvent(intfc, event, data) {
            if (this.requester != null) {
                console.log('sending event ', {request: '@@ev', intfc, event, data});
                ++this.requestId;
                this.requester.request('@@ev', {intfc, event, data}, 0, 5000, (response) => console.log(response));
            }
        }

        sendRequestEvent(requestId, event, data) {
            if (this.requester != null) {
                this.sendInterfaceEvent('', requestId.toString(), {event, data});
            }
        }

        cancelRequest(requestId) {
            this.sendRequestEvent(requestId, 'cancel');
        }

        doRequest(request, profile, params, progress, timeout = DEFAULT_TIMEOUT) {
            let level = 0, requestId;

            if (this.requester == null) {
                this.initRequester();
            }

            // this is weak but we have no choice
            requestId = (++this.requestId).toString();
            if (progress != null && progress.result) {
                level = 1;
            }
            if (progress != null && progress.regular) {
                level += 1;
                if (progress.traceEnabled && typeof progress.trace === 'function') {
                    level += 1;
                    progress.trace('external ', request);
                }
            }

            function progressListener(data) {
                if (data.message != null && typeof progress.log === 'function') {
                    progress.log(data.message, -1, data.type);
                } else if (data.data != null && typeof progress.result === 'function') {
                    progress.result(data.data);
                }
            }

            if (progress != null) {
                this.requestEvents.on(requestId, progressListener);
            }

            const finalize = (result) => {
                if (progress != null && progress.traceEnabled) {
                    progress.trace('end external ', request);
                }
                this.requestEvents.un(requestId, progressListener);
                return result;
            };

            return [
                new Promise((resolve) => {
                    this.requester.request(request, {profile, params}, level, timeout, resolve, (err) => resolve({error: err}));
                }).then(finalize),
                requestId
            ];
        }

        request(...args) {
            return this.doRequest(...args)[0];
        }
    }

    adrem.ExternalRequester = ExternalRequester;
})();

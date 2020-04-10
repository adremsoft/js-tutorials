/***************************************************************
 *
 *  Author   : Tomasz Kunicki
 *  Created  : 3/19/2020
 *
 * No part of this file may be duplicated, revised, translated,
 * localized or modified in any manner or compiled, linked or
 * uploaded or downloaded to or from any computer system without
 * the prior written consent of AdRem Software sp z o.o.
 *
 * 2020 Copyright Tomasz Kunicki, all rights reserved
 * 2020 Copyright AdRem Software, all rights reserved
 ****************************************************************/
"use strict";

require('./webapp');

const
    OBJ_ID = Symbol('object-id'),
    CONNECTION_CONTEXT = Symbol('ctx'),
    {adrem} = require('./client.min');

function $args(func) {
    return (func + '')
        .replace(/[/][/].*$/mg, '') // strip single-line comments
        .replace(/\s+/g, '') // strip white space
        .replace(/[/][*][^/*]*[*][/]/g, '') // strip multi-line comments
        .split('){', 1)[0].replace(/^[^(]*[(]/, '') // extract the parameters
        .replace(/=[^,]+/g, '') // strip any ES6 defaults
        .split(',').filter(Boolean); // split & filter [""]
}

let
    privateInstance = 1;

class AppServer {
    constructor() {
        this.registered = new Map();
        this.connections = new Map();
        this.trace = false;
    }

    static getPrivateId() {
        privateInstance += 1;
        return '#prv:' + privateInstance;
    }

    /**
     * Register server service
     * @param {String} intfName
     * @param {Object | Class} def
     * @param {Boolean} isPrivate - it's internal server interface Plugin <> JS so it won't be exported
     */
    register(intfName, def, isPrivate) {
        intfName = intfName || AppServer.getPrivateId();
        isPrivate = isPrivate || intfName.charAt(0) === '#';
        if (typeof def === 'object') {
            def[OBJ_ID] = intfName;
            this.registered.set(intfName, {def, isPrivate});
        } else if (typeof def === 'function') {
            this.registered.set(intfName, {def, instances: new Map(), lastId: 1});
        } else {
            throw new Error("You can register object or prototype (class) function");
        }
        return intfName;
    }

    unregister(intfName) {
        const def = this.registered.get(intfName);
        if (def != null) {
            if (def.instances != null) {
                def.instances.clear();
                def.def = null;
            }
            this.registered.delete(intfName);
        }
    }

    openConn(connId, context) {
        this.connections.set(connId, context);
    }

    closeConn(connId) {
        this.connections.delete(connId);
    }

    setConnContext(connId, obj) {
        obj[CONNECTION_CONTEXT] = connId !== 0 ? this.connections.get(connId) : {connId};
    }

    getInterfaces() {
        function getInterfaceDef(name, obj) {
            const
                props = Object.getOwnPropertyDescriptors(typeof obj === 'object' ? obj : obj.prototype),
                methods = Object.fromEntries(Object.entries(props)
                    .filter(([name, desc]) => name !== 'constructor' && typeof desc.value === 'function')
                    .map(([name, desc]) => {
                        const args = Object.fromEntries($args(desc.value).map(name => ([name, "Variant"])));
                        return ([name, args]);
                    }));
            return {
                GUID: name,
                Methods: methods
            };
        }

        // Return interface definition
        return Object.fromEntries(Array.from(this.registered.entries())
            .filter(([name, def]) => !def.isPrivate)
            .map(([name, def]) => ([name, getInterfaceDef(name, def.def)]))
        );
    }

    getInst(interfaceName, instance) {
        const def = this.registered.get(interfaceName);
        if (def != null) {
            return def.instances != null ? def.instances.get(instance) : def.def;
        }
        return def;
    }

    newInst(interfaceName, params) {
        const def = this.registered.get(interfaceName);
        if (def != null) {
            if (def.instances != null) {
                const instance = new def.def(params);
                if (instance != null) {
                    def.lastId += 1;
                    const id = def.lastId;
                    instance[OBJ_ID] = interfaceName + '.' + id;
                    def.instances.set(id, instance);
                    return id;
                }
            } else {
                // it's a singleton
                return 0;
            }
        }
        return -1;
    }

    releaseInst(interfaceName, iid) {
        if (iid !== 0) {
            const def = this.registered.get(interfaceName);
            if (def != null && def.instances != null) {
                const instance = def.instances.get(iid);
                if (typeof instance.destroy === 'function') {
                    instance.destroy();
                }
                def.instances.delete(iid);
            }
        }
    }

    start() {
        return new Promise(resolve => {
            adrem.initClient();
            adrem.Client.start((result) => resolve(result));
        });
    }

    async handleRequest(req) {
        const
            {conn, func, param, inst} = req,
            [intf, method, submethod] = func.split('.'),
            instance = this.getInst(intf, inst);

        function doCall(f) {
            if (typeof f === 'function') {
                if (Array.isArray(param)) {
                    return f.call(instance, ...param);
                } else {
                    return f.call(instance, param);
                }
            }
        }

        if (this.trace) {
            console.log(req);
        }
        if (instance != null) {
            this.setConnContext(conn, instance);
            if (submethod) {
                return doCall(instance[method][submethod]);
            } else {
                return doCall(instance[method]);
            }
        }
    }
}

const
    appServer = new AppServer();


appServer.register('Server', {
    test(params) {
        console.log('Test called of Server interface', params);
    },

    getInterfaces() {
        return appServer.getInterfaces();
    },

    openConn(connId, context) {
        appServer.openConn(connId, context);
    },

    closeConn(connId, context) {
        appServer.closeConn(connId);
    },

    getInstance(interfaceName) {
        return appServer.newInst(interfaceName);
    },

    releaseInstance(interfaceName, instance) {
        appServer.releaseInst(interfaceName, instance);
    }
}, true);

let
    serverStarted;

module.exports = {
    ready: new Promise(resolve => serverStarted = resolve),
    currentAtlasInfo: {},
    adrem,

    // shared services kind of dependency injection
    services: {},

    registerService(name, serviceObj) {
        if (this.services[name] == null) {
            this.services[name] = serviceObj;
        } else {
            console.error(`Service ${name} registered already`);
        }
    },

    /**
     * Run Server
     * @return {Promise<*>}
     */
    run(beforStarted) {
        appServer.start().then(() => {
            adrem.Client.on('exception', e => console.error(e));
            adrem.Client.on(adrem.srv.IServer.id, (e) => {
                appServer
                    .handleRequest(e.data.req)
                    .then(res => {
                        if (e.data.id != null) {
                            adrem.srv.IServer.response({id: e.data.id, res: [res]});
                        }
                    })
                    .catch(err => {
                        console.error(err);
                        if (e.data.id != null) {
                            adrem.srv.IServer.response({id: e.data.id, res: []});
                        }
                    });
            });

            if (adrem.ncSrv.ICurrentAtlas != null) {
                const currentAtlas = new adrem.ncSrv.ICurrentAtlas();
                adrem.Client.on(currentAtlas.id, e => {
                    if (e.data.Id !== this.currentAtlasInfo.Id) {
                        console.log('NodeServer: Atlas changed - restarting');
                        adrem.srv.IServer.restart();
                    }
                    this.currentAtlasInfo = e.data;
                });

                currentAtlas.GetAtlasInfo(info => {
                    if (info != null && info.Id > 0) {
                        this.currentAtlasInfo = info;
                        adrem.srv.IServer.notifyStarted(async () => {
                            if (beforStarted != null && typeof beforStarted === 'function') {
                                await beforStarted();
                            }
                            serverStarted();
                        });
                    } else {
                        console.log('NodeServer: No Atlas loaded - exiting (after 15sec)');
                        setTimeout(() => adrem.srv.IServer.restart(), 15 * 1000);
                    }
                });
            } else {
                serverStarted();
            }
        });

        return this.ready;
    },

    /**
     * Register server service
     * @param {String} intfName
     * @param {Object | Class} def
     * @param {Boolean} isPrivate
     */
    registerRemoteInterface(intfName, def, isPrivate = false) {
        return appServer.register(intfName, def, isPrivate);
    },

    releaseRemoteInterface(intfName) {
        return appServer.unregister(intfName);
    },

    /**
     *
     * @param instance remote object instance
     * @param id event id
     * @param data event data
     */
    notifyClient(instance, id, data) {
        adrem.srv.IServer.event(instance[OBJ_ID], id, data);
    },

    /**
     * Get client connection context for the remote object
     * @param instance remote object instance
     * @return {*}
     */
    getConnCtx(instance) {
        return instance[CONNECTION_CONTEXT];
    }
};

global.restart = function () {
    console.log('Application will restart');
    adrem.srv.IServer.restart();
};

global._appServer = appServer;

/***************************************************************
 *
 *  Author   : Tomasz Kunicki
 *  Created  : 3/21/2020
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

const
    EventEmitter = require('events'),
    {adrem, registerRemoteInterface, releaseRemoteInterface} = require("./app-server");

const
    AUTO_KEY = -1,
    NO_KEY = -1,
    EVENT_CONNECTED = 1,
    EVENT_DISCONNECTED = 0,
    EVENT_OPENED = 100,
    DataListFieldType = {
        afString: 0,
        afBoolean: 1,
        afFloat: 2,
        afDate: 2, // it's just an alias to float
        afInt32: 3,
        afInt64: 4,
        afVariant: 5,
        afPacket: 6
    };

let
    dataListInstanceId = 1;

class CustomDataList {
    constructor(perform, intfName) {
        this.intfc = null;                  // Server Interface
        this.perform = perform;             // Interface for handling perform method calls
        dataListInstanceId += 1;
        this.instId = dataListInstanceId;
        this.remoteIntf = intfName;
        this.events = new EventEmitter();
        this.connected = false;
        this.providerId = '';
    }

    get _dl() {
        if (this.intfc == null) {
            this.intfc = adrem.srv[this.remoteIntf]();
            adrem.Client.on(this.intfc.id, this._onRemoteEvent, this);
        }
        return this.intfc;
    }

    _onRemoteEvent(e) {
        switch (e.eventid) {
            case EVENT_CONNECTED :
                this.onConnected();
                break;
            case EVENT_DISCONNECTED :
                this.onDisconnected();
                break;
            case EVENT_OPENED :
                this.onOpened();
                break;
        }
    }

    finalize() {
        adrem.Client.un(this.intfc.id, this._onRemoteEvent, this);
        if (this.providerId != null) {
            releaseRemoteInterface(this.providerId);
        }
    }

    onOpened() {
        setTimeout(() => this.events.emit('opened'), 0);
    }

    /**
     * Event from server that cache is connected and ready
     */
    onConnected() {
        this.connected = true;
        this.events.emit('connected');
    }

    /**
     * Event from server that cache id disconnected and sending data to it will have no effect
     */
    onDisconnected() {
        this.connected = false;
        this.events.emit('disconnected');
    }

    /**
     *
     * @param  {String} tableName
     * @param  {Array<{fieldName : String, fieldType : DataListFieldType }>} fields
     * @param {Boolean} persistent
     */
    async open(tableName, fields, persistent = true) {
        this.providerId = '';
        if (this.perform != null) {
            this.providerId = '#' + (tableName || this._dl.id.replace('.', '_'));
            registerRemoteInterface(this.providerId, this, true);
        }
        return new Promise(resolve => {
            this.events.once('opened', () => {
                resolve();
                if (persistent) {
                    this.connected = true;
                }
            });
            this._dl.open(tableName, this.providerId, fields, persistent);
        });
    }

    /**
     * Update record
     * @param rec
     */
    update(rec) {
        this._dl.update(rec);
    }

    /**
     * Delete record by key
     * @param key
     */
    delete(key) {
        this._dl.delete(key);
    }

    /**
     * Update all records in the dataList cache
     * @param recList
     */
    updateAll(recList) {
        this._dl.updateAll(recList);
    }

    /**
     * Send change marker event
     * @param {*} marker
     */
    sendChangeMarker(marker) {
        this._dl.sendChangeMarker(marker);
    }

    /**
     * Set properties of the category
     * @param {String} category
     * @param {Object} values
     */
    setProperties(category, values) {
        this._dl.setProperties(category, values);
    }

    /**
     * Change single property for category
     * @param {String} category
     * @param {String} name
     * @param {*} value
     * @param {Boolean} updateNow
     */
    setProperty(category, name, value, updateNow = true) {
        this._dl.setProperty(category, name, value, updateNow);
    }

    /**
     * Close DataList
     */
    close() {
        this._dl.close();
    }
}

class LiveReport extends CustomDataList {
    constructor(perform) {
        super(perform, 'ILiveReport');
    }

    /**
     * Get key for the next record
     * @return {*}
     */
    get newKey() {
        return this._dl.newKey();
    }

    /**
     *
     * @param  {String} tableName
     * @param  {Array<{fieldName : String, fieldType : DataListFieldType }>} fields
     * @param  {{ name : String, doNotPublish : Boolean}} autoColumn
     */
    async open(tableName, fields, autoColumn = null) {
        const persistent = tableName !== '';
        this.providerId = '';
        if (this.perform != null) {
            this.providerId = '#' + (tableName || this._dl.id.replace('.', '_'));
            registerRemoteInterface(this.providerId, this, true);
        }
        return new Promise(resolve => {
            this.events.once('opened', () => {
                resolve();
                if (persistent) {
                    this.connected = true;
                }
            });
            this._dl.open(tableName, this.providerId, fields, autoColumn, persistent);
        });
    }


    /**
     *
     * @param key
     * @param rec
     */
    update(key, rec) {
        this._dl.update(key, rec);
    }

    /**
     * Number of connected clients
     * @return {*}
     */
    get connectedClients() {
        return this._dl.connectedClients();
    }

    /**
     * Get numeric key for given keyValue
     * @param keyValue
     * @return {*}
     */
    uniqueKey(keyValue) {
        return this._dl.uniqueKey(keyValue);
    }

    /**
     * Clear all published cache data
     */
    clear() {
        this._dl.clear();
    }

    /**
     * Update for complex indexes (advanced feature)
     * @param parentKey
     * @param data
     */
    updateList(parentKey, data) {
        this._dl.updateList(parentKey, data);
    }

    /**
     * Delete record by key
     * @param key
     */
    deleteByKey(key) {
        this._dl.deleteByKey(key);
    }

    /**
     * Delete record by autoKey column value
     * @param key
     */
    deleteByValue(key) {
        this._dl.deleteByValue(key);
    }
}

class DataListSource extends CustomDataList {
    constructor(perform) {
        super(perform, 'IDataListSource');
    }

    /**
     *
     * @param  {String} tableName
     * @param  {Array<{fieldName : String, fieldType : DataListFieldType }>} fields
     * @param  {Boolean} readOnly
     * @param {Boolean} persistent
     */
    async open(tableName, fields, readOnly = true, persistent = true) {
        this.providerId = readOnly && this.perform == null ? '' : '#' + (tableName || this._dl.id);
        if (this.providerId !== '') {
            registerRemoteInterface(this.providerId, this, true);
        }
        return new Promise(resolve => {
            this.events.once('opened', () => resolve());
            this._dl.open(tableName, this.providerId, fields, persistent && (tableName !== ''), readOnly);
        });
    }

    // Remote requests for modifying data source
    /**
     * Create or Update record for new record pass -1 key
     * @param key
     * @param value
     * @return {Number} should be key
     */
    reqUpdate(key, value) {
        return -1;
    }

    /**
     * Delete multiple records
     * @param {Array<Number>}keys
     * @return (Number) number of records deleted
     */
    reqDelete(keys) {
        return 0;
    }

    /**
     * Clear all data
     * @return {number} return number of records deleted
     */
    reqClear() {
        return 0;
    }
}

module.exports = {
    NO_KEY,
    AUTO_KEY,
    LiveReport,
    DataListSource,
    DataListFieldType,

    /**
     *
     * @param name
     * @param desc
     * @param {function( params : Object ) : { source : CustomDataList, autoRelease : Boolean }}  providerFunction
     * @return {*}
     */
    registerDataListSourceProvider(name, desc, providerFunction) {
        const
            intfName = registerRemoteInterface('#' + name, {
                getDataListSource(params) {
                    const info = providerFunction(params) || {};
                    if (info.source != null && info.source instanceof CustomDataList) {
                        return info.source.open().then(() => {
                            // live report needs table name to access its provider
                            if (info.source instanceof LiveReport) {
                                const sourceName = name + (params != null ? ':' + JSON.stringify(params) : '');
                                info.source._dl.setProviderName(sourceName);
                            }
                            return {provider: info.source.intfc.id, autoRelease: info.autoRelease};
                        });
                    }
                    return null;
                }
            }),
            provider = new adrem.srv.IDataListSourceProvider({table: name, intf: intfName});
    }
};

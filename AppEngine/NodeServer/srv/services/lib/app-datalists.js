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
    {registerRemoteInterface} = require("./app-server");

const
    NO_KEY = -1,
    DataListFieldType = {
        afString: 0,
        afBoolean: 1,
        afFloat: 2,
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
        this.instId = ++dataListInstanceId;
        this.remoteIntf = intfName;
        this.events = new EventEmitter();
        this.connected = false;
    }

    get _dl() {
        if (this.intfc == null) {
            this.intfc = adrem.srv[this.remoteIntf]();
            adrem.Client.on(this.intfc.id, (e) => {
                if (e.eventid === 1) {
                    this.onConnected()
                } else if (e.eventid === 0) {
                    this.onDisconnected()
                } else if (e.eventid === 100) {
                    this.onOpened();
                }
            })
        }
        return this.intfc;
    }

    onOpened() {
        this.events.emit('opened');
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
     * @param  {{ name : String, doNotPublish : Boolean}} autoColumn
     * @param  {Boolean} persistent
     */
    async open(tableName, fields, autoColumn = null, persistent = true) {
        let providerIntf = '';
        if (this.perform != null) {
            providerIntf = '#' + (tableName || this._dl.id);
            registerRemoteInterface(providerIntf, this, true);
        }
        return new Promise(resolve => {
            this.events.once('opened', () => {
                resolve();
                if (persistent) {
                    this.connected = true;
                }
            });
            this._dl.open(tableName, providerIntf, fields, autoColumn, persistent && (tableName !== ''));
        })
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
        this._dl.close()
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
        return this._dl.uniqueKey(keyValue)
    }

    /**
     * Clear all published cache data
     */
    clear() {
        this._dl.clear()
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
     * Update for complex indexes (advanced feature)
     * @param parentKey
     * @param data
     */
    updateList(parentKey, data) {
        this._dl.updateList(parentKey, data)
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
     * @param  {Boolean} persistent
     */
    async open(tableName, fields, readOnly = true, persistent = true) {
        const providerIntf = readOnly && this.perform == null ? '' : '#' + (tableName || this._dl.id);
        if (providerIntf !== '') {
            registerRemoteInterface(providerIntf, this, true);
        }
        return new Promise(resolve => {
            this.events.once('opened', () => resolve());
            this._dl.open(tableName, providerIntf, fields, persistent, readOnly);
        })
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
    LiveReport,
    DataListSource,
    DataListFieldType,

    /**
     *
     * @param name
     * @param desc
     * @param {function( src:String, prefix: String,  )}providerFunction
     * @return {*}
     */
    registerDataListSourceProvider(name, desc, providerFunction) {
        const
            intfName = registerRemoteInterface('#' + name, {
                getDataListSource(src, params) {
                    return providerFunction(src, params);
                }
            }),
            provider = new adrem.srv.IDataListSourceProvider();
        provider.registerProvider(intfName, desc);
    }
};


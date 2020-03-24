/***************************************************************
 *
 *  Author   : Tomasz Kunicki
 *  Created  : 3/22/2020
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
    {getConnCtx} = require("./app-server"),
    {DataListSource, DataListFieldType} = require("./app-datalists");

const
    dataQueryProviders = new Map();

class DataTreeValues extends Map {
    constructor(createChild) {
        super();
        this._createChild = createChild;
    }

    /**
     * Clear all values
     */
    clear() {
        this.forEach(c => c.delete(true));
        super.clear();
    }

    /**
     * Delete value
     * @param {String} key
     */
    delete(key) {
        const c = this.get(key);
        if (c != null) {
            c.delete(true);
            super.delete(key)
        }
    }

    _getValueNode(name, allowCreate = true) {
        return this.get(name) || (allowCreate ? this._createChild(name) : null)
    }

    /**
     * Update single value
     * @param {String} name
     * @param {*} value
     */
    update(name, value) {
        this.getValueNode(name).value = value;
    }

    /**
     * Update child values by object
     * @param {Object} values
     */
    updateAll(values) {
        const keys = new Set(Object.keys(values));
        this.forEach(c => {
            if (!keys.has(c.name)) {
                this.delete(c.name);
            }
        });
        Object.entries(values).forEach(([name, value]) => this.update(name, value));
    }
}

/**
 * Tree Node
 * allows to update
 *  - value
 *  - values - list of child values (TreeNode)
 */
class DataTreeNode {
    constructor(owner, id, parent, name, value) {
        this.id = id;
        this.name = name;
        this.values = new DataTreeValues((name) => new DataTreeNode(this._owner, this._owner._nextKey, this, name));
        this._owner = owner;
        this._parent = parent;
        this.value = value;
        if (this._parent) {
            this._parent._addChild(this);
            this.parent = this._parent.id;
        } else {
            this.parent = -1;
        }

        Object.defineProperty(this, '_owner', {enumerable: false});
        Object.defineProperty(this, '_parent', {enumerable: false});
        Object.defineProperty(this, '_value', {enumerable: false, writable: true});
        Object.defineProperty(this, 'value', {
            enumerable: true,
            get() {
                return this._value;
            },

            set(value) {
                if (this._value !== value) {
                    this._value = value;
                    if (this._owner) {
                        this._owner._update(this);
                    }
                }
            }
        });
        Object.defineProperty(this, 'values', {enumerable: false});
        Object.defineProperty(this, 'name', {writable: false}); // name is read-only
        Object.defineProperty(this, 'id', {writable: false}); // id is read-only

        this._owner._update(this);
    }

    /**
     * Value path
     * @return {string|*}
     */
    get path() {
        if (this._parent != null) {
            return this._parent.path + '\\' + this.name;
        } else {
            return this.name;
        }
    }

    /**
     * Send change marker for given tree node
     * @param marker
     */
    sendChangeMarker(marker) {
        if (this._owner) {
            this._owner._sendChangeMarker(path, marker);
        }
    }

    /**
     * Clear all children
     */
    clear() {
        this.values.clear();
    }

    _addChild(child) {
        this.values.set(child.name, child);
    }

    _delChild(child) {
        this.values.delete(child.name);
    }

    _getNode(path, allowCreate) {
        const parts = Array.isArray(path) ? path : path.split('\\').filter(s => s !== '');
        return parts.reduce((parent, name) => parent != null ? parent.values._getValueNode(name, allowCreate) : null, this);
    }

    /**
     * Get Tree Node
     * @param {String |String[]} path
     * @param {*} value
     * @return {DataTreeNode}
     */
    liveValue(path, value) {
        const node = this._getNode(path, true);
        if (value !== undefined) {
            node.value = value;
        }
        return node;
    }

    /**
     * Delete value
     * @param {String | String[]} path - relative path to node
     */
    deleteValue(path) {
        const node = this._getNode(path);
        if (node != null) {
            node.delete();
        }
    }

    /**
     * Delete node and all children
     * @param fromParent
     */
    delete(fromParent = false) {
        if (this._owner != null) {
            this._owner._delete(this);
            this._owner = null;
            this.values.clear();
            if (!fromParent && (this._parent != null)) {
                this._parent._delChild(this)
            }
            this._parent = null;
            delete this.values;
        }
    }
}

class DataTreeSource {
    constructor(name) {
        this._store = new DataListSource({
            query: (params) => {
                const {path, type, query} = params || {};
                console.log('query passed ', params);
                if (path != null) {
                    const node = this.liveValue(path);
                    if (node.queryProvider != null) {
                        return node.queryProvider.query(query);
                    } else {
                        const provider = dataQueryProviders.get(type);
                        if (provider != null && typeof provider === 'function') {
                            if (provider.prototype != null) {
                                node.queryProvider = new provider(node, ctx);
                                return node.queryProvider.query(query);
                            } else {
                                return provider(node, query, getConnCtx(this._store));
                            }
                        }
                    }
                }
                return {error: 'Invalid query or provider not founc', code: -2};
            }
        });
        this._lastKey = 1;
        this._store.events.on('connected', () => {
            this._publish(this.root);
            console.log('Tree Connected');
        });
        this._store.events.on('disconnected', () => console.log('Tree DisConnected'));
        this.root = new DataTreeNode(this, this._nextKey, null, '');

        this._store.open(name, [
            {fieldName: 'Id', fieldType: DataListFieldType.afInt32, key: true},
            {fieldName: 'Parent', fieldType: DataListFieldType.afInt32},
            {fieldName: 'Name', fieldType: DataListFieldType.afString},
            {fieldName: 'Value', fieldType: DataListFieldType.afVariant}
        ], true, false);
    }

    get connected() {
        return this._store.connected
    }

    get _nextKey() {
        this._lastKey += 1;
        return this._lastKey;
    }

    _publish(node) {
        this._store.update(node);
        node.values.forEach(n => this._publish(n));
    }

    _sendChangeMarker(path, marker) {
        if (this.connected) {
            this._store.sendChangeMarker({path, marker});
        }
    }

    _delete(node) {
        if (this.connected) {
            this._store.delete(node.id);
        }
    }

    _update(node) {
        //console.log('updating ', node);
        if (this.connected) {
            this._store.update(node)
        }
    }

    clear() {
        this.root.values.clear();
    }

    /**
     * Delete value
     * @param {String | String[]}path
     */
    deleteValue(path) {
        return this.root.deleteValue(path);
    }

    /**
     * Get Data Tree Node
     * @param {String |String[]}path
     * @param {*} value
     * @return {DataTreeNode}
     */
    liveValue(path, value) {
        return this.root.liveValue(path, value);
    }
}

module.exports = {
    /**
     * Register query provider function it should return confirmation to
     * client that query has been accepted or {error: String} object
     * @param {String} queryType
     * @param {function(root : DataTreeNode, query : *, context: *) : *} queryFunc
     *
     */
    registerQueryProvider(queryType, queryFunc) {
        dataQueryProviders.set(queryType, queryFunc);
    },
    DataTreeSource
};

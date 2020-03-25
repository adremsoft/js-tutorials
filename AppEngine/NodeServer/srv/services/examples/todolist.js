"use strict";

const {DataListSource, DataListFieldType, NO_KEY} = require("../lib/app-datalists");

class TodoList extends DataListSource {
    constructor() {
        super();
        this.data = new Map();
        this.lastKey = 1;
    }

    get nextKey() {
        this.lastKey += 1;
        return this.lastKey;
    }

    open() {
        super.open('TodoList', [
            {fieldName: 'id', fieldType: DataListFieldType.afInt32, key: true},
            {fieldName: 'done', fieldType: DataListFieldType.afBoolean},
            {fieldName: 'task', fieldType: DataListFieldType.afString},
        ], false, true);
    }

    add(task) {
        const rec = {
            id: this.nextKey,
            done: false,
            task
        };
        this.data.set(rec.id, rec);
        if (this.connected) {
            this.update(rec);
        }
    }

    reqUpdate(key, value) {
        // Add record with no key
        if (key === NO_KEY) {
            key = this.nextKey;
            this.data.set(key, value);
        }
        value.id = key;
        this.update(value); // notify cache
        return key;
    }

    reqDelete(keys) {
        keys.forEach(key => {
            this.data.delete(key);
            this.delete(key); // notify cache
        });

        return keys.length;
    }

    reqClear() {
        const count = this.data.clear();
        this.updateAll([]); // delete all records
        return count;
    }

    onConnected() {
        super.onConnected();
        console.log('TodoList Connected ', this.data);
        this.updateAll(Array.from(this.data.values()))
    }

}

module.exports = async function (server) {
    await server.ready;
    const todoList = new TodoList();
    todoList.add('Learn typescript');
    todoList.open();
};


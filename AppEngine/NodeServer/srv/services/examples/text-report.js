"use strict";
const {LiveReport, DataListFieldType, registerDataListSourceProvider} = require("../lib/app-datalists");

const readline = require('readline');
const fs = require('fs');

class TextFile extends LiveReport {
    constructor(fileName) {
        super({
            // simply reload the content
            reload() {
                this.clear();
                this.lastKey = 1;
                this.load();
            }
        });
        this.lastKey = 1;
        this.fileName = fileName;

        console.log('TextFile created ', fileName);

        // it's important to open as open attaches this object to server and
        // assigns intfc.is
        this.open();
    }

    get nextKey() {
        this.lastKey += 1;
        return this.lastKey;
    }

    open() {
        this.events.once('opened', () => this.load());
        super.open('', [
            {fieldName: 'line', fieldType: DataListFieldType.afString}
        ], null, true);
    }

    load() {
        const
            lineReader = readline.createInterface({
                input: fs.createReadStream(__dirname + '\\..\\data\\' + this.fileName)
            });

        lineReader.on('line', line => this.update(this.nextKey, {line}));
        console.log(`Text file ${this.fileName} loaded`);
    }
}

module.exports = async function (server) {
    await server.ready;

    // This is like class factory for DataLists
    // So clients can open multiple files by passing tableName as 'TextFile:{"fileName":"info.txt"}'
    registerDataListSourceProvider('TextFile', '', (params) => {
        const source = new TextFile(params.fileName);
        return {provider: source.intfc.id, autoRelease: true};
    })
};

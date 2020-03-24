"use strict";

const {LiveReport, DataListFieldType} = require("../lib/app-datalists");

const
    MAX_RECS = 5;

class ConsoleLog extends LiveReport {
    constructor() {
        super({
            // this method can be called by dataList.perform("addMessage", { msg : 'some message' })
            addMessage({msg}) {
                console.log(msg)
            }
        });
        this.lastKey = 1;
        this.interceptConsoleLog();
    }

    get nextKey() {
        this.lastKey += 1;
        return this.lastKey;
    }

    interceptConsoleLog() {
        this.log = console.log;
        console.log = (...args) => {
            this.log.call(console, ...args);
            if (this.connected) {
                super.update(this.nextKey, {message: args.join(' ')});
                if (this.lastKey > MAX_RECS) {
                    super.deleteByKey(this.lastKey - MAX_RECS);
                }
            }
        }
    }

    open() {
        super.open('ConsoleLog', [
            {fieldName: 'message', fieldType: DataListFieldType.afString}
        ], null, true);
    }

}

module.exports = async function (server) {
    await server.ready;
    const logDataList = new ConsoleLog();
    logDataList.open();
    console.log('ConsoleLog opened');
};

/**
 *  Delphi -> NodeJS Requester
 *  Version: 1.51
 *
 *  2017-2019 Copyright Tomasz Kunicki, AdRem Software, all rights reserved
 */
"use strict";

const
    EVENT_PREFIX = '\x07',
    RESPONSE_PREFIX = '\x02',
    DATA_SEPARATOR = '\x01',
    ALIVE_TOKEN = '\x06',
    LOG_MESSAGE = '\x03',
    handlers = [],
    KEEP_ALIVE_TIME = 3 * 1000,

    readLine = require('readline').createInterface({
        input: process.stdin
    });


let
    lastMessageSent = 0,
    errorReporting = null,
    outputReady = true;

process.stdin.setEncoding('utf8');
process.stdout.setEncoding('utf8');
process.stdin.setNoDelay(true);
process.stdout.setNoDelay(true);

const
    outputBuffer = [];

function sendMessage(prefix, data) {
    try {
        if (data != null) {
            if (typeof data !== "string") {
                data = JSON.stringify(data);
            }
            outputBuffer.push(prefix + data);
        } else {
            outputBuffer.push(prefix);
        }
        lastMessageSent = Date.now();
    } catch (e) {
        console.error('Error processing response:', e);
    }
}

function patchConsoleInfo() {
    const prevInfo = console.info;
    console.info = function (message) {
        prevInfo(LOG_MESSAGE + message);
    };
}

// This is kind of throttling
// so we send no more then limited number of KB per each interval
const
    MAX_BATCH_COUNT = 64,       // 64 requests in batch
    MAX_BUFF_SIZE = 10 * 1000;  // 10K if possible

setInterval(function () {
    if (outputReady && outputBuffer.length > 0) {
        let len = 0, cnt = 0;

        // optimized version of the loop
        for (let bufLen = outputBuffer.length; cnt < bufLen && cnt < MAX_BATCH_COUNT && len <= MAX_BUFF_SIZE; cnt += 1) {
            len += outputBuffer[cnt].length;
        }

        /* original unoptimized code
        outputBuffer.some(data => {
            cnt += 1;
            len += data.length;
            return (len > MAX_BUFF_SIZE) || (cnt >= MAX_BATCH_COUNT);
        });
         */

        if (cnt > 1 && len > MAX_BUFF_SIZE) {
            cnt -= 1;
        }
        if (cnt === outputBuffer.length) {
            outputReady = process.stdout.write(outputBuffer.join('\n') + '\n');
            outputBuffer.length = 0;
        } else {
            outputReady = process.stdout.write(outputBuffer.splice(0, cnt).join('\n') + '\n');
        }
        if (!outputReady) {
            process.stdout.once("drain", () => outputReady = true);
        }
    }
}, 5);

class Requester {
    static setErrorReporting(handler) {
        errorReporting = handler;
    }

    static sendEvent(data) {
        sendMessage(EVENT_PREFIX, data);
    }

    static addHandler(handler) {
        handlers.unshift(handler);
    }

    static doProcessRequest(req) {
        try {
            if (!handlers.some(h => h(req))) {
                console.error('Invalid request - no handler found ', req);
                req.response(null);
            }
        } catch (e) {
            if (errorReporting) {
                errorReporting.logErrorReport('Error processing request:', e, ' request ', req);
            }
        }
    }

    static processRequest(requestId, params) {
        Requester.doProcessRequest(new Request(requestId, params));
    }
}

class Request {
    constructor(id, req) {
        this.id = id;
        this.request = req;
        return this;
    }

    response(response) {
        if (response !== undefined) {
            sendMessage(RESPONSE_PREFIX, {id: this.id, response});
        } else {
            sendMessage(RESPONSE_PREFIX, {id: this.id});
        }
        return true;
    }
}

readLine.on('line', line => {
    try {
        const [requestId, data] = line.split(DATA_SEPARATOR);
        Requester.processRequest(parseInt(requestId, 16), JSON.parse(data));
    } catch (e) {
        console.error('Error processing request:', e, data);
    }
});

process.on('uncaughtException', err => {
    console.error("Uncaught exception", err);
});

setInterval(function () {
    if ((Date.now() - lastMessageSent) > KEEP_ALIVE_TIME) {
        sendMessage(ALIVE_TOKEN);
    }
}, Math.round(KEEP_ALIVE_TIME / 2));

patchConsoleInfo();

module.exports = Requester;

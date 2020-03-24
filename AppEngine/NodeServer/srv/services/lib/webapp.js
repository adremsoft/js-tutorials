/**
 *  Node WebApp Adapter
 *
 *  Author: Tomasz Kunicki
 *  2017-2019 (c) Copyright Tomasz Kunicki, all rights reserved
 *
 *  Adapter allows simulating embedded protocol between host application written in Delphi and NodeJs client modules
 *
 */
"use strict";

const
    requester = require("./requester.js"),
    PARAM_SEPARATOR = '\x09';

let
    pendingRequests = new Map(),
    lastRequestId = 1;

global.__SendRequest = function (url, intf, method, data, callback) {
    lastRequestId += 1;
    pendingRequests.set(lastRequestId, { callback, intf, method });
    global._pending = pendingRequests;
    requester.sendEvent([lastRequestId, url, intf, method, data, ''].join(PARAM_SEPARATOR));
};

function processResponse(response) {
    const[rid, status, data] = response,
        request = pendingRequests.get(rid);

    if (request) {
        pendingRequests.delete(rid);
        try {
            request.callback(status, data);
        } catch (e) {
            console.error('Error processing callback ', e);
            console.log('data ', data);
        }
    } else {
        console.log('>> wrong rid received', rid);
    }
}

function dispatchEvent(event) {
    global.__dispatchEvents(JSON.parse(event));
}

requester.addHandler(function (env) {
    if (env.request.event != null) {
        dispatchEvent(env.request.event);
    } else if (env.request.rspn != null) {
        processResponse(env.request.rspn);
    } else {
        return false;
    }
    return true;
});

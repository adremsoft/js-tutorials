"use strict";

const
    {registerQueryProvider, DataTreeSource} = require("../lib/app-datatree.js"),
    NUMBER_OF_CPUS = require('os').cpus().length;

registerQueryProvider('timer', class {
    constructor(node, ctx) {
        this.node = node;
    }

    /**
     * As provider is persistent it can handle commands
     * @param q
     */
    query(q) {
        if (q.command === 'start') {
            this.start(q.interval || 1000);
        }
        if (q.command === 'stop') {
            this.stop();
        }
    }

    start(intv) {
        if (this.interval != null) {
            this.stop();
        }
        this.interval = setInterval(() => this.publishTime(), intv)
    }

    stop() {
        if (this.interval != null) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    publishTime() {
        this.node.value = new Date();
    }
});

registerQueryProvider('processor', class {
    constructor(node) {
        this.node = node;
        this.init();
        this.interval = setInterval(() => this.publish(), 1000);
    }

    hrtimeToMS(val) {
        return val[0] * 1000 + val[1] / 1000000;
    }

    init() {
        this.startTime = process.hrtime();
        this.startUsage = process.cpuUsage();
    }

    query() {
    }

    publish() {
        const
            elapsedTime = process.hrtime(this.startTime),
            elapsedUsage = process.cpuUsage(this.startUsage),
            elapsedTimeMS = this.hrtimeToMS(elapsedTime),
            elapsedUserMS = elapsedUsage.user / 1000,
            elapsedSystMS = elapsedUsage.system / 1000;

        this.init();
        this.node.value = Math.round(10000 * (elapsedUserMS + elapsedSystMS) / elapsedTimeMS / NUMBER_OF_CPUS) / 100;
    }
});

module.exports = async function (server) {
    await server.ready;
    const dashboard = new DataTreeSource('dashboard');
};

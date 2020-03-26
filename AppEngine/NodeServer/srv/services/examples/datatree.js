"use strict";

const
    {registerQueryProvider, DataTreeSource} = require("../lib/app-datatree.js");

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

    init() {
        this.startTime = process.hrtime();
        this.startUsage = process.cpuUsage();
    }

    query() {
    }

    publish() {
        const
            elapTime = process.hrtime(this.startTime),
            elapUsage = process.cpuUsage(this.startUsage),
            elapTimeMS = CPUSensor.hrtimeToMS(elapTime),
            elapUserMS = elapUsage.user / 1000,
            elapSystMS = elapUsage.system / 1000;

        this.init();
        this.node.value = Math.round(10000 * (elapUserMS + elapSystMS) / elapTimeMS / NUMBER_OF_CPUS) / 100;
    }
});

module.exports = async function (server) {
    await server.ready;
    const dashboard = new DataTreeSource('dashboard');
};

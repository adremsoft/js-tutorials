"use strict";

module.exports = function (server) {
    // This is a singleton
    server.registerRemoteInterface('IEcho', {
        echo(msg) {
            console.log('echo called: ', msg);
            return msg
        }
    });

    // Create instance and send event to the client
    server.registerRemoteInterface('ITimerEvents', class {
        start(timeMs = 1000) {
            this.stop();
            this.interval = setInterval(() => {
                server.notifyClient(this, 0, new Date());
            }, timeMs)
        }

        stop() {
            if (this.interval) {
                clearInterval(this.interval);
                this.interval = null;
            }
        }
    })
};

module.paths.push("./lib");

const
    server = require('app-server');

// Register remote interfaces

require("./examples/remote-interfaces")(server);
require("./examples/livereport")(server);

// and then start the server
server.run();

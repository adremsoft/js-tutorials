module.paths.push("./lib");

const
    server = require('app-server');

// Register remote interfaces

require("./examples/remote-interfaces")(server);
require("./examples/livereport")(server);
require("./examples/todolist")(server);
require("./examples/datatree")(server);

// and then start the server
server.run();

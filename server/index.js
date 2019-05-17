const
    http = require("http"),
    log = require("./log"),
    app = require("express")(),
    server = http.Server(app),
    port = require('./config').port,
    api = require('./api'),
    io = require('./io')

const clientManager = new ClientManager();
const messenger = require('./io/messenger')(clientManager)

api(app, messenger)
io(server, messenger,clientManager)

//start server
server.listen(port, function () {
    log.info(`listening on port:  ${port}`);
    console.log(`listening on port:  ${port}`);
});
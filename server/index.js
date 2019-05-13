const
    http = require("http"),
    log = require("./log"),
    app = require("express")(),
    server = http.Server(app),
    port = require('./config').port,
    api = require('./api'),
    io = require('./io')

api(app)
io(server)

//start server
server.listen(port, function () {
    log.info(`listening on port:  ${port}`);
    console.log(`listening on port:  ${port}`);
});
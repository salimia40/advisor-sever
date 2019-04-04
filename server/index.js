process.env.NODE_ENV = 'production';

const express = require("express"),
    http = require("http"),
    clientHandler = require("./io/clientHandler"),
    log = require("./log/log"),
    app = express(),
    server = http.Server(app),
    io = require('socket.io')(server),
    port = require('./config').port,
    routes = require('./routes');

app.use('/', routes);

//start listening to socket
io.on('connection', clientHandler);

//start server
server.listen(port, function () {
    log.info(`listening on port:  ${port}`);
    console.log(`listening on port:  ${port}`);
});
const clientHandler = require("./clientHandler"),
client2 = require("./client.v2"),
Socket = require('socket.io')

// setup socket.io
module.exports = (server) => {
    const io = Socket(server)
    //start listening to socket
    io.on('connection', clientHandler);
    //new server using jwt
    const ioV2 = io.of('/v2');
    ioV2.on('connection', client2(ioV2));
}
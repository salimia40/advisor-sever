const 
client2 = require("./client.v2"),
Socket = require('socket.io')

// setup socket.io
module.exports = (server, Messenger,ClientManager) => {
    const io = Socket(server)
    //start listening to socket
    //new server using jwt
    const ioV2 = io.of('/v2');
    const clientHandler = client2(ioV2,Messenger,ClientManager)
    ioV2.on('connection', clientHandler);
}
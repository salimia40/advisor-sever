import * as Protocol from '../../../constants/Protocol.js';
import io from 'socket.io-client';

export default class Socket {

    constructor( onLogin,onChange, onSocketError) {
        this.onLogin = onLogin;
        this.onChange = onChange;
        this.onSocketError = onSocketError;
        this.socket = null;
        this.user = null;
        this.port = null;
    }


    connect = (port = 5000) => {

        this.port = port;

        // Connect
        const host = `http://localhost:${port}`;
        this.socket = io.connect(host);

        // Set listeners
        
        this.socket.on(Protocol.CONNECT, this.onConnected);
        this.socket.on(Protocol.LOGIN, this.onLogin);
        this.socket.on(Protocol.DISCONNECT, this.onDisconnected);
        this.socket.on(Protocol.CONNECT_ERR, this.onError);
        this.socket.on(Protocol.RECONNECT_ERR, this.onError);
    };

    // Received connect event from socket
    onConnected = () => {
        console.log("connected")
        this.sendIdent();
        this.onChange(true);
    };

    // Received disconnect event from socket
    onDisconnected = () => this.onChange(false);

    // Send an identification message to the server

    // todo get user info from cookie
    sendIdent = () => this.socket.emit(Protocol.IDENT, this.user);
    // Send a message over the socket
    sendIm = message => this.socket.emit(Protocol.IM, message);

    // Close the socket
    disconnect = () => this.socket.close();

    // Received error from socket
    onError = message => {
        this.onSocketError(message);
        this.disconnect();
    };

    register = user => {
        this.connect();
        console.log('sending register   '+ user);
        this.socket.emit(Protocol.REGISTER,user);
    }

}
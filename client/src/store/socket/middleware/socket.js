import {Protocol} from '../../../constants/';
import io from 'socket.io-client';

export default class Socket {

    constructor( onLogin,onChange, onSocketError,onConnected) {
        this.onLogin = onLogin;
        this.onChange = onChange;
        this.onSocketError = onSocketError;
        this.onConnectedEvent = onConnected;
        this.socket = null;
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
        this.onConnectedEvent();
        console.log("connected");
        this.onChange(true);
    };

    // Received disconnect event from socket
    onDisconnected = () => this.onChange(false);
    disconnect = () => this.socket.close();
    register = user => this.socket.emit(Protocol.REGISTER,user);    
    login = user => this.socket.emit(Protocol.LOGIN,user);

    // Received error from socket
    onError = message => {
        this.onSocketError(message);
        this.disconnect();
    };

}
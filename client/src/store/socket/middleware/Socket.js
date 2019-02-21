import {Protocol} from '../../../constants/';
import io from 'socket.io-client';

export default class Socket {

    constructor( onLogin,onChange, onSocketError,onConnected,onUserUpdated,onPasswordChanged) {
        this.onLogin = onLogin;
        this.onChange = onChange;
        this.onSocketError = onSocketError;
        this.onConnectedEvent = onConnected;
        this.onUserUpdated = onUserUpdated;
        this.onPasswordChanged = onPasswordChanged;
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
        this.socket.on(Protocol.UPDATE_USER, this.onUserUpdated);
        this.socket.on(Protocol.CHANGE_PASSWORD, this.onPasswordChanged);
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
    updateEmail = data => this.socket.emit(Protocol.UPDATE_EMAIL,data);
    updateAvatar = data => this.socket.emit(Protocol.UPDATE_AVATAR,data);
    updateBio = data => this.socket.emit(Protocol.UPDATE_BIO,data);
    updateName = data => this.socket.emit(Protocol.UPDATE_NAME,data);
    changePassword = data => this.socket.emit(Protocol.CHANGE_PASSWORD,data);
    logout = (data = {}) => this.socket.emit(Protocol.LOGOUT,data);

    // Received error from socket
    onError = message => {
        this.onSocketError(message);
        this.disconnect();
    };

}
import {Protocol} from '../../constants';

// The socket's connection state changed
export const connectionChanged = isConnected => {
    return {
        type: Protocol.CONNECTION_CHANGED,
        connected: isConnected,
        isError: false
    };
};

// The user clicked the connect button
export const connectSocket = () => {
    return {
        type: Protocol.CONNECT_SOCKET
    };
};

// The user clicked the disconnect button
export const disconnectSocket = () => {
    return {
        type: Protocol.DISCONNECT_SOCKET
    };
}

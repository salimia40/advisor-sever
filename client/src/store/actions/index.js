// Socket related actions
export const CONNECTION_CHANGED = 'socket/connection-changed';
export const PORT_CHANGED       = 'socket/port-changed';
export const CONNECT_SOCKET            = 'socket/connect';
export const DISCONNECT_SOCKET         = 'socket/disconnect';
export const STATUS_CHANGED         = 'status/status-changed';

import {Protocol} from '../../../constants';


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

export const statusChanged = (status,isError) => {
    return {
        type: Protocol.STATUS_CHANGED,
        status: status,
        isError:isError
    };
}


export const login = (user) =>  {
    return {
        type : Protocol.LOGIN,
        user : user
    }
}

export const register = (user) => {
    return {
        type : Protocol.DO_REGISTER,
        user : user
    }
}

import Socket from "./Socket";
import { statusChanged } from "../../status/actions";

import {
    connectionChanged,
    CONNECT_SOCKET,
    DISCONNECT_SOCKET,
} from "../../actions";
import { login } from "../../user/actions";
import { Protocol } from "../../../constants";


const socketMiddleware = store => {

    console.log('middleware')
    // The socket's connection state changed

    const onLogin = (userInfo) => {
        store.dispatch(login(userInfo))
    }

    const onConnectionChange = isConnected => {
        store.dispatch(connectionChanged(isConnected));
        store.dispatch(statusChanged(isConnected ? 'Connected' : 'Disconnected'));
    };

    // There has been a socket error
    const onSocketError = (status) => store.dispatch(statusChanged(status, true));

    // The server has updated us with a list of all users currently on the system
    
    const socket = new Socket(
        onLogin,
        onConnectionChange,
        onSocketError
    );

    // Return the handler that will be called for each action dispatched
    return  next => action => {

        console.log('next is going on')


        switch (action.type) {

            case Protocol.DO_REGISTER:
                console.log('caling register method')
                socket.register(action.user);
                break;

            case CONNECT_SOCKET:
                socket.connect(5000);
                break;

            case DISCONNECT_SOCKET:
                socket.disconnect();
                break;

            default:
                break;
        }

        return next(action)
    };
};

export default socketMiddleware;
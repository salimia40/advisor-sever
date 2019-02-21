import Socket from "./Socket";
import * as Actions from '../../actions'
import { Protocol } from "../../../constants";
import Cookie from './cookie';


const socketMiddleware = store => {

    // The socket's connection state changed

    const cookie = new Cookie();

    const onLogin = (result) => {
        if (result.success) {
            cookie.saveTempUser();
            store.dispatch(Actions.onLogin(result.user));
        }
        store.dispatch(Actions.statusChanged(result.message, !result.success));
        console.log(`login response`)
        console.log(`login response: ${result.success}`)
        console.log(`login response: ${result.message}`)
        console.log(`login response: ${result.user}`)
        console.log(`cookie: ${cookie.getCookie('username')}`)
        console.log(`cookie: ${cookie.getCookie('password')}`)
    }

    const onConnectionChange = isConnected => {
        store.dispatch(Actions.connectionChanged(isConnected));
        store.dispatch(Actions.statusChanged(isConnected ? 'Connected' : 'Disconnected'));
    };

    // There has been a socket error
    const onSocketError = (status) => store.dispatch(Actions.statusChanged(status, true));

    // Received connect event from socket
    const onConnected = () => {
        // retrive login info from cookie if any anf attempt login
        if (cookie.checkCookie('username') && cookie.checkCookie('password')) {
            let user = {
                username: cookie.getCookie('username'),
                password: cookie.getCookie('password'),
            }
            store.dispatch(Actions.login(user));
        }
    };

    const onUserUpdated = data => {
        store.dispatch(Actions.statusChanged(data.message));
        store.dispatch(Actions.onUserUpdate(data.user));
    }

    const onPasswordChanged = data => {
        store.dispatch(Actions.statusChanged(data.message, !data.success));
        store.dispatch(Actions.onUserUpdate(data.user));
    }

    const socket = new Socket(
        onLogin,
        onConnectionChange,
        onSocketError,
        onConnected,
        onUserUpdated,
        onPasswordChanged
    );

    // Return the handler that will be called for each action dispatched
    return next => action => {

        switch (action.type) {

            case Protocol.CONNECT_SOCKET:
                socket.connect();
                break;

            case Protocol.DISCONNECT_SOCKET:
                socket.disconnect();
                break;

            case Protocol.LOGIN:
                cookie.setTempUser(action.user.username, action.user.password);
                socket.login(action.user);
                break;

            case Protocol.REGISTER:
                cookie.setTempUser(action.user.username, action.user.password);
                socket.register(action.user);
                break;

            case Protocol.UPDATE_EMAIL:
                socket.updateEmail(action.data);
                break;

            case Protocol.UPDATE_NAME:
                socket.updateName(action.data);
                break;

            case Protocol.UPDATE_AVATAR:
                socket.updateAvatar(action.data);
                break;

            case Protocol.UPDATE_BIO:
                socket.updateBio(action.data);
                break;

            case Protocol.CHANGE_PASSWORD:
                socket.changePassword(action.data);
                break;

            case Protocol.LOGOUT:
                socket.logout();
                break;

            case Protocol.STATUS_CHANGED:
            setTimeout(() =>{ store.dispatch(Actions.statusChanged('')) }, 5000);
                break;

            default:
                break;
        }

        return next(action)
    };
};

export default socketMiddleware;
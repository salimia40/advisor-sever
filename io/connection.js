const queueManager = require('./queueManager');
const Client = require('./clientManager');

/*********************************
 TODO list:
 simple Login and register for advisors
 // add email confirmation and password recovery
 student creation and management function for advisors
 post and comment that advisors can create posts and students receive their advisor's post and both can comment
 student information updates
 advisor-student chat
 groups that work like facebook
 *********************************/


var clients = new Map();
var users = new Map();


const connectionListener = client => {

    let clientManager = new Client(client,
        //on disconnect
        () => {
            clients.delete(client.id);
        },
        //on login
        (loggedin, user) => {
            if (loggedin) {
                users.set(user.id, client);
            } else {
                users.delete(user.id);
            }
        },
        //client injector
        (action) => {
            if (users.has(action.userId)) {
                var clientId = users.get(action.userId);
                if (clients.has(clientId)) {
                    var clientManager = clients.get(clientId);
                    clientManager.callAction(action);
                } else queueManager(action);
            } else queueManager(action);
        }, client.emit
    );
    clients.set(client.id, clientManager);
    client.on(Protocol.MESSAGE_SEND, clientManager.onSendMessage);
    client.on(Protocol.MESSAGE_UPDATE, clientManager.onUpdateMessage);
    client.on(Protocol.MESSAGE_DELETE, clientManager.onDeleteMessage);
    client.on(Protocol.MESSAGE_GET, clientManager.onGetMessage);
    client.on(Protocol.USER_LOGIN, clientManager.user.login);
    client.on(Protocol.USER_REGISTER, clientManager.user.register);
    client.on(Protocol.USER_UPDATE_BIO, clientManager.user.updateBio);
    client.on(Protocol.USER_UPDATE_NAME, clientManager.user.updateName);
    client.on(Protocol.USER_UPDATE_EMAIL, clientManager.user.updateEmail);
    client.on(Protocol.USER_UPDATE_AVATAR, clientManager.user.updateAvatar);
    client.on(Protocol.USER_CHANGE_PASSWORD, clientManager.user.changePassword);
    client.on(Protocol.STUDENT_UPDATE, clientManager.user.updateStudent);
    client.on(Protocol.STUDENT_GET, clientManager.user.sendStudent);
    client.on(Protocol.USER_LOGOUT, clientManager.user.logout);
    client.on(Protocol.DISCONNECT, () => {
        clientManager.disconnect(client);
        clientManager.onDisconnect();
    });
};

module.exports = connectionListener;
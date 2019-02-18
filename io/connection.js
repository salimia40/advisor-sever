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
                users.set(user.id,client);
            } else {
                users.delete(user.id);
            }
        },
        //client injector
        (action) => {
            if (users.has(action.userId)) {
                var clientId = users.get(action.userId);
                if(clients.has(clientId)){
                    var clientManager = clients.get(clientId);
                    clientManager.callAction(action);
                } else queueManager(action);
            } else queueManager(action);
        }
        );
    clients.set(client.id, clientManager);
};

module.exports = connectionListener;
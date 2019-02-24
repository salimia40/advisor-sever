const Client = require('./clientManager');
const Protocol = require("./protocol");
const log = require("../log/log");

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

const dataManager = require('./DataManager');

const connectionListener = client => {

    log.info(`datamanager call: ${dataManager.callUser}`);

    let clientManager = new Client(
        //on login
        (loggedin, userId) => {
            if (loggedin) {
                dataManager.loginClient(client.id,userId);
                return false;
            } else {
                return dataManager.logoutUser(client.id,userId);
            }
        },
        //client injector
        dataManager.callUser, client.emit
    );

    // clients.set(client.id, clientManager);
    client.on(Protocol.MESSAGE_SEND, clientManager.onSendMessage);
    client.on(Protocol.MESSAGE_UPDATE, clientManager.onUpdateMessage);
    client.on(Protocol.MESSAGE_DELETE, clientManager.onDeleteMessage);
    client.on(Protocol.MESSAGE_GET, clientManager.onGetMessage);
    client.on(Protocol.BLOG_GET, clientManager.getBlogs);
    client.on(Protocol.BLOG_UPDATE, clientManager.updateBlog);
    client.on(Protocol.BLOG_DELETE, clientManager.deleteBlog);
    client.on(Protocol.BLOG_COMMENT_ADD, clientManager.commentBlog);
    client.on(Protocol.BLOG_COMMENT_REMOVE, clientManager.removeCommentBlog);
    client.on(Protocol.BLOG_SEND, clientManager.sendBlog);
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
    client.on(Protocol.USER_FIND, clientManager.user.findUsers);
    client.on(Protocol.USER_GET, clientManager.user.getUser);
    client.on(Protocol.USER_GET_ADVISOR, clientManager.user.getAdvisor);
    client.on(Protocol.DISCONNECT, () => {
        clientManager.disconnect(client);
        dataManager.disconnectClient(client.id);
    });

    dataManager.addClient(client.id, clientManager);
};

module.exports = connectionListener;
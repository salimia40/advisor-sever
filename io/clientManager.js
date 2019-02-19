const log = require("../log/log");
const Message = require("../models/message");
const Protocol = require("./protocol");
const UserManager = require('./userManager');
const Queue = require('../models/queue');

class Client {

    constructor( onDisconnect, onLogin, clientInjector, emit) {
        // this.client = client;
        this.emit = emit;
        this.onDisconnect = onDisconnect;
        // log.debug(this.client.emit)
        // this.client.emit('test', { msg: 'hi' })
        this.onLogin = onLogin;
        this.user = new UserManager(this.onLoginHandler, this.emit);
        this.clientInjector = clientInjector;
        // this.client.on(Protocol.DISCONNECT, () => {
        //     this.disconnect(this.client);
        //     this.onDisconnect();
        // });
        // this.client.on(Protocol.MESSAGE_SEND, this.onSendMessage);
        // this.client.on(Protocol.MESSAGE_UPDATE, this.onUpdateMessage);
        // this.client.on(Protocol.MESSAGE_DELETE, this.onDeleteMessage);
        // this.client.on(Protocol.MESSAGE_GET, this.onGetMessage);
        // this.client.on(Protocol.USER_LOGIN, user.login);
        // this.client.on(Protocol.USER_REGISTER, user.register);
        // this.client.on(Protocol.USER_UPDATE_BIO, user.updateBio);
        // this.client.on(Protocol.USER_UPDATE_NAME, user.updateName);
        // this.client.on(Protocol.USER_UPDATE_EMAIL, user.updateEmail);
        // this.client.on(Protocol.USER_UPDATE_AVATAR, user.updateAvatar);
        // this.client.on(Protocol.USER_CHANGE_PASSWORD, user.changePassword);
        // this.client.on(Protocol.STUDENT_UPDATE, user.updateStudent);
        // this.client.on(Protocol.STUDENT_GET, user.sendStudent);
        // this.client.on(Protocol.USER_LOGOUT, user.logout);
    }

    callAction(action) {
        switch (action.type) {
            case Protocol.ActionTypes.message:
                Message.findById(action.data.messageId, (err, message) => {
                    message.state.received = true;
                    message.save();
                    this.emit(Protocol.MESSAGE_SEND, message)
                });
                return;
            default: return;
        }
    };

    onLoginHandler(bool, user) {
        this.onLogin(bool, user);
        // find unrecieved mesages and send
        Queue.findOne({ userId: user.id }, (err, queue) =>{
            for (var i = (--queue.messages.length); i > 0; i--) {
                let mId = queue.messages.pop();
                Message.findById(mId, (err, message) => {
                    this.emit(Protocol.MESSAGE_SEND, message);
                })
            }
            queue.save();
        });
    };

    onDeleteMessage(data) {

        //todo confirm that user is message owner
        Message.findById(data.messageId,  (err, message) => {
            if (message.from == this.user.getUserId()) {
                message.content = null;
                message.deleted = true;
                message.save((err, message) => {
                    if (err) return;
                    this.emit(Protocol.MESSAGE_SEND, message);
                    this.clientInjector({
                        type: Protocol.ActionTypes.message,
                        userId: message.to,
                        data: {
                            messageId: message._id
                        }
                    })
                });
            }
        })
    };

    onUpdateMessage(data) {

        Message.findById(data.messageId, (err, message) =>{
            if (message.from == this.user.getUserId()) {
                message.content = data.content;
                message.updated = true;
                message.save((err, message) => {
                    if (err) return;
                    this.emit(Protocol.MESSAGE_SEND, message);
                    this.clientInjector({
                        type: Protocol.ActionTypes.message,
                        userId: message.to,
                        data: {
                            messageId: message.id
                        }
                    })
                });
            }
        })
    };

    onSendMessage(data) {
        if (this.user.isLoggedin) {
            let message = new Message({
                from: this.user.getUserId,
                ...data
            });
            message.save((err, message)=> {
                if (err) return;
                this.emit(Protocol.MESSAGE_SEND, message);
                this.clientInjector({
                    type: Protocol.ActionTypes.message,
                    userId: message.to,
                    data: {
                        messageId: message.id
                    }
                })
            });
        }
    };

    onGetMessage(data) {
        var userId = this.user.getUserId();

        if (data.other === null) {
            Message.getAllChats(userId,  (err, messages) =>{
                messages.forEach((message) => {
                    this.emit(Protocol.MESSAGE_SEND, message);
                });
            });
        } else {
            Message.getUserChats(userId, data.other,  (err, messages) =>{
                messages.forEach((message) => {
                    this.emit(Protocol.MESSAGE_SEND, message);
                });
            });
        }
    };

    disconnect() {
        if (this.user.isLoggedin()) {
            this.user.logout();
        }
    };
}

module.exports = Client;
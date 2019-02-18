const log = require("../log/log");
const Message = require("../models/message");
const Protocol = require("./protocol");
const UserManager = require('./userManager');
const Queue = require('../models/queue');

class Client {


    constructor(client, onDisconnect, onLogin, clientInjector) {
        this.client = client;
        this.onDisconnect = onDisconnect;
        // log.debug(this.client.emit)
        this.client.emit('test',{msg:'hi'})
        this.onLogin = onLogin;
        this.user = new UserManager(client, this.onLoginHandler);
        this.clientInjector = clientInjector;
        this.client.on(Protocol.DISCONNECT, () => {
            this.disconnect(this.client);
            this.onDisconnect();
        });
        this.client.on(Protocol.MESSAGE_SEND, this.onSendMessage);
        this.client.on(Protocol.MESSAGE_UPDATE, this.onUpdateMessage);
        this.client.on(Protocol.MESSAGE_DELETE, this.onDeleteMessage);
        this.client.on(Protocol.MESSAGE_GET, this.onGetMessage);
    }

    callAction  (action)  {
        switch (action.type) {
            case Protocol.ActionTypes.message:
                Message.findById(action.data.messageId, (err, message) => {
                    message.state.received = true;
                    message.save();
                    this.client.emit(Protocol.MESSAGE_SEND, message)
                });
                return;
            default: return;
        }
    };

    onLoginHandler  (bool,user) {
        this.onLogin(bool,user);
        // find unrecieved mesages and send
        Queue.findOne({userId : user.id},function(err,queue){
            for(var i = (--queue.messages.length); i > 0; i--){
                let mId = queue.messages.pop();
                Message.findById(mId,(err,message)=>{
                    this.client.emit(Protocol.MESSAGE_SEND, message);
                })
            }
            queue.save();
        });
    };

    onDeleteMessage  (data)  {

        //todo confirm that user is message owner
        Message.findById(data.messageId, function(err, message){
            if (message.from == this.user.getUserId()) {
                message.content = null;
                message.deleted = true;
                message.save((err, message) => {
                    if (err) return;
                    this.client.emit(Protocol.MESSAGE_SEND, message);
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

    onUpdateMessage  (data) {

        Message.findById(data.messageId, function(err, message){
            if (message.from == this.user.getUserId()) {
                message.content = data.content;
                message.updated = true;
                message.save((err, message) => {
                    if (err) return;
                    this.client.emit(Protocol.MESSAGE_SEND, message);
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

    onSendMessage  (data) {
        if (this.user.isLoggedin) {
            let message = new Message({
                from: this.user.getUserId,
                ...data
            });
            message.save(function(err, message){
                if (err) return;
                this.client.emit(Protocol.MESSAGE_SEND, message);
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
        
        if(data.other === null){
            Message.getAllChats(userId,function(err,messages){
                messages.forEach((message)=>{
                    this.client.emit(Protocol.MESSAGE_SEND, message);
                });
        });    
        } else {
            Message.getUserChats(userId,data.other,function(err,messages){
                messages.forEach((message)=>{
                    this.client.emit(Protocol.MESSAGE_SEND, message);
                });
            });
        }
    };

    disconnect  ()  {
        if (this.user.isLoggedin()) {
            this.user.logout();
        }
    };
}

module.exports = Client;
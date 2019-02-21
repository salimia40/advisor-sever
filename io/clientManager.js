const log = require("../log/log");
const Message = require("../models/message");
const Protocol = require("./protocol");
const UserManager = require('./userManager');
const Queue = require('../models/queue');
const Blog = require('../models/blog');

class Client {

    constructor(onLogin, clientInjector, emit) {
        this.emit = emit;
        this.onLogin = onLogin;
        this.user = new UserManager(this.onLoginHandler, this.emit);
        this.clientInjector = clientInjector;
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
        Queue.findOne({ userId: user.id }, (err, queue) => {
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
        Message.findById(data.messageId, (err, message) => {
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

        Message.findById(data.messageId, (err, message) => {
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
    };

    onGetMessage(data) {
        var userId = this.user.getUserId();

        if (data.other === null) {
            Message.getAllChats(userId, (err, messages) => {
                messages.forEach((message) => {
                    this.emit(Protocol.MESSAGE_SEND, message);
                });
            });
        } else {
            Message.getUserChats(userId, data.other, (err, messages) => {
                messages.forEach((message) => {
                    this.emit(Protocol.MESSAGE_SEND, message);
                });
            });
        }
    };

    getBlogs(data) {
        var aId = this.user.isAdvisor() ? this.user.getUserId() : this.user.getAdvisorId();
        Blog.find({userId: aId},(err,blogs)=>{
            blogs.forEach(blog => this.emit(Protocol.BLOG_GET,blog));
        })
    }
    
    updateBlog(data) {
        Blog.findById(data._id,(err,blog)=>{
            blog.title = data.title;
            blog.document = data.document;
            blog.save((err,blog)=> {
                this.emit(Protocol.BLOG_GET,blog);
            })
        })
    }
    
    deleteBlog(data) {
        Blog.findById(data._id,(err,blog)=>{
            blog.deleted = true;
            blog.save((err,blog)=> {
                this.emit(Protocol.BLOG_GET,blog);
            })
        })
    }
    
    sendBlog(data) {
        var aId = this.user.getUserId();
        blog = new Blog();
        blog = Object.assign(blog,{userId:aId},...data);
        blog.save((err,blog)=> {
            this.emit(Protocol.BLOG_GET,blog);
        })
    }
    
    commentBlog(data) {
        Blog.findById(data._id,(err,blog)=>{
            blog.comments.push(data.comment);
            blog.save((err,blog)=> {
                this.emit(Protocol.BLOG_GET,blog);
            })
        })
    }
    
    removeCommentBlog(data) {
        Blog.findById(data._id,(err,blog)=>{
            blog.comments.filter((comment) => comment._id === data.cId)
            blog.save((err,blog)=> {
                this.emit(Protocol.BLOG_GET,blog);
            })
        })
    }

    disconnect() {
        if (this.user.isLoggedin()) {
            this.user.logout();
        }
    };
}

module.exports = Client;
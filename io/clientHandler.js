const uuid = require('uuid'),
    log = require("../log/log"),
    User = require('../models/user'),
    Message = require('../models/message'),
    Student = require('../models/student'),
    Blog = require('../models/blog'),
    Queue = require('../models/queue'),
    events = require('events');

class ClientData {
    constructor(clientId, oncall) {
        this.clientId = clientId;
        this.userId = null;
        this.oncall = oncall;
    }

    login(bool, userId) {
        this.userId = bool ? userId : null;
    }

}

const Protocol = {
    USER_LOGIN: 'user/login',
    USER_REGISTER: 'user/register',
    USER_REGISTER_Student: 'user/register/student',
    USER_UPDATE_USER: 'user/update-user',
    USER_UPDATE_EMAIL: 'user/update-email',
    USER_UPDATE_NAME: 'user/update-name',
    USER_UPDATE_AVATAR: 'user/update-avatar',
    USER_UPDATE_BIO: 'user/update-bio',
    USER_LOGOUT: 'user/logout',
    USER_CHANGE_PASSWORD: 'user/change-password',
    USER_FIND: 'user/find',
    USER_GET: 'user/get',
    USER_GET_ADVISOR: 'user/get/advisor',
    GROUP_CREATE: 'group/create',
    GROUP_UPDATE: 'group/update',
    GROUP_GET: 'group/get',
    GROUP_GET_ALL: 'group/get/all',
    GROUP_FIND: 'group/find',
    GROUP_GET_OWNER: 'group/get/owner',
    GROUP_GET_MEMBER: 'group/get/members',
    GROUP_POST_GET: 'group/post/get',
    GROUP_POST_GET_ALL: 'group/post/get/all',
    GROUP_POST: 'group/post',
    GROUP_POST_DELETE: 'group/post/delete',
    GROUP_POST_EDIT: 'group/post/edit',
    GROUP_COMMENT: 'group/comment',
    GROUP_COMMENT_DELETE: 'group/comment/delete',
    GROUP_COMMENT_EDIT: 'group/comment/edit',
    MESSAGE_SEND: 'message/send',
    MESSAGE_GET: 'message/get',
    MESSAGE_UPDATE: 'message/update',
    MESSAGE_DELETE: 'message/delete',
    STUDENT_GET: 'student/get',
    STUDENT_UPDATE: 'student/update',
    BLOG_SEND: 'blog/send',
    BLOG_GET: 'blog/get',
    BLOG_UPDATE: 'blog/update',
    BLOG_DELETE: 'blog/delete',
    BLOG_COMMENT_ADD: 'blog/comment/add',
    BLOG_COMMENT_REMOVE: 'blog/comment/remove',
    UserTypes: {
        advisor: 'advisor',
        student: 'student'
    },
    ActionTypes: {
        message: 'message',
        blog: 'blog'
    },
    DISCONNECT: 'disconnect'
}

class DataManager {

    constructor() {
        this.clientDatas = [];
    }

    addClient(clientId, clientManager) {
        this.clientDatas.push(
            new ClientData(clientId, clientManager)
        )
    }

    loginClient(clientId, userId = null) {
        var clientData = this.clientDatas.find((c) => c.clientId === clientId);
        clientData.login(true, userId);
    }

    logoutUser(clientId, userId) {
        return new Promise((res) => {
            var clientDatasS = this.clientDatas.filter((c) => c.userId === userId);
            var clientData = clientDatasS.find((c) => c.clientId === clientId);
            console.log(`nomber of clients ${clientDatasS.length}`)
            clientData.login(false, userId);
            res(!(clientDatasS.length > 1))
        })
    }

    disconnectClient(clientId) {
        this.clientDatas = clientDatas.filter((c) => c.clientId !== clientId);
    }

    callUser(action) {

        clientDatas = this.clientDatas.filter((c) => c.userId === action.userId);
        clientDatas.forEach(clientData => clientData.oncall(action));

    }
}
const dataManager = new DataManager();
const messenger = new events.EventEmitter();

const MessageCodes = {
    MESSAGE = 'message',
    BLOG = 'blog'
}

messenger.on(MessageCodes.MESSAGE, (message) => {
    User.isOnline(message.to).then(bool => {
        if (bool) return dataManager.callUser({
            type: Protocol.ActionTypes.message,
            userId: message.to,
            messageId: message.id
        })
        else return queueMessage(message.to, message.id);
    })
    User.isOnline(message.from).then(bool => {
        if (bool) return dataManager.callUser({
            type: Protocol.ActionTypes.message,
            userId: message.from,
            messageId: message.id
        })
        else return queueMessage(message.from, message.id);
    })

})

messenger.on(MessageCodes.BLOG, blog => {
    User.find().students(blog.userId).then(users => {
        users.forEach(user => {
            if (user.isOnline) {
                dataManager.callUser({
                    type: Protocol.ActionTypes.blog,
                    userId: user.id,
                    blogId: blog.id
                })
            } else queueBlog(user.id, blog.id);
        })
    })
    User.findById(blog.userId).then(user => {
        if (user.isOnline) {
            dataManager.callUser({
                type: Protocol.ActionTypes.blog,
                userId: user.id,
                blogId: blog.id
            })
        } else queueBlog(user.id, blog.id);
    })
})

function queueBlog(uid, blogId) {
    Queue.getUserQueue(uid).then(queue => {
        if (!queue) {
            queue = new Queue({
                userId: uid
            })
            queue.save();
        }
        queue.blogs.push(blogId)
        queue.save();
    })
}

function queueMessage(uid, messageId) {
    Queue.getUserQueue(uid).then(queue => {
        if (!queue) {
            queue = new Queue({
                userId: uid
            })
            queue.save();
        }
        queue.messages.push(messageId)
        queue.save();
    })
}

class USER {
    constructor() {
        this._user = null;
    }

    set user(user) {
        this._user = user;
    }

    get user() {
        return this._user;
    }

    get id() {
        return this._user._id;
    }

    get isAdvisor() {
        return this._user.role == Protocol.UserTypes.advisor
    }

    get advisorId() {
        return (this._user.role == Protocol.UserTypes.advisor) ? this._user._id : this._user.advisorId;
    }

    get loggedin() {
        return this.user != null;
    }
}

const clientHandler = (client) => {
    var _user = new USER();
    dataManager.addClient(client.id, (action) => {
        switch (action.type) {
            case Protocol.ActionTypes.message:
                Message.findById(action.messageId, (err, message) => {
                    message.state.received = true;
                    message.save();
                    client.emit(Protocol.MESSAGE_SEND, message)
                });
                return;
            case Protocol.ActionTypes.blog:
                Blog.findById(action.blogId).then(blog =>
                    client.emit(Protocol.BLOG_GET, blog)
                )
                return;
            default:
                return;
        }
    })

    function login(data) {
        let username = data.username;
        let password = data.password;
        User.findByUsername(username).then(user => {
            if (!user) return client.emit(Protocol.USER_LOGIN, {
                success: false,
                message: 'user not found'
            });
            user.checkPassword(password).then(isMatch => {
                if (!isMatch) return client.emit(Protocol.USER_LOGIN, {
                    success: false,
                    message: 'incorrect password'
                });
                user.isOnline = true;
                user.save();
                _user.user = user;
                onLogin();
                return client.emit(Protocol.USER_LOGIN, {
                    success: true,
                    message: 'login successful',
                    user: user
                });
            })
        })
    }

    function onLogin() {
        dataManager.loginClient(client.id, _user.id);
        Queue.getUserQueue(_user.id).then(queue => {
            if (!queue) return;
            if (queue.messages.length == 0) return;
            for (var i = (--queue.messages.length); i > 0; i--) {
                let mId = queue.messages.pop();
                Message.findById(mId).then((message) => {
                    client.emit(Protocol.MESSAGE_SEND, message);
                })
            }
            queue.save();
        })
    }

    function register(data) {

        let user = new User();
        user.username = data.username;
        user.email = {
            email: data.email,
            confirmed: false,
            confirmCode: uuid()
        };
        user.password = data.password;
        user.name = data.name;
        user.role = data.role;

        var makingstudent = (_user.user != null && _user.isAdvisor && user.role == Protocol.UserTypes.student);
        var makingadvisor = (_user.user != null && _user.isAdvisor && user.role == Protocol.UserTypes.advisor);

        if (makingstudent) {
            user.advisorId = _user.id;
        } else if (!makingadvisor) {
            user.advisorId = data.advisorId;
        }

        User.findByUsername(user.username).then(existing => {
            if (existing) return client.emit(Protocol.USER_REGISTER_Student, {
                success: false,
                message: 'user already exists'
            });

            User.createUser(user).then(newUser => {
                newUser.isOnline = true;
                newUser.save();
                this.emit(Protocol.USER_REGISTER_Student, {
                    success: true,
                    user: newUser,
                    message: 'user created'
                });

                createQueue(newUser);

                if (isStudent(newUser)) createStudent(newUser)

                if (_user.user == null) {
                    _user.user = newUser;
                    dataManager.loginClient(client.id, _user.id);
                }

            })
        })

    }

    function createQueue(user) {
        var queue = new Queue({
            userId: user.id
        });
        queue.save();
    }

    function isStudent(user) {
        return user.role === Protocol.UserTypes.student
    }

    function createStudent(user) {
        var student = new Student();
        student.username = user.username;
        student.userId = user._id;
        student.advisorId = user.advisorId;
        student.save().then(st => client.emit(Protocol.STUDENT_GET, st));
    }

    function sendStudent(ignored) {
        Student.findOne({
            userId: _user.id
        }).then((student) =>
            client.emit(Protocol.STUDENT_GET, student)
        );
    }

    function updateStudent(data) {
        Student.findOne({
            userId: _user.id
        }).then((student) => {
            student = Object.assign(student, data)
            student.save().then(st => {
                client.emit(Protocol.STUDENT_GET, st)
            })
        });
    }

    function findUsers(data) {
        User.findUsers(data.querry).then((users) => {
            client.emit(Protocol.USER_FIND, users);
        })
    }

    function getAdvisor(data) {
        _user.user.getAdvisor().then((user) => {
            client.emit(Protocol.USER_GET_ADVISOR, user);
        })
    }

    function getUser(data) {
        User.findById(data.findById).then((user) => {
            client.emit(Protocol.USER_GET, user);
        })
    }

    function updateEmail(data) {
        if (_user.user != null) {
            _user.user.email = null;
            _user.user.email.email = data.email;
            _user.user.email.confirmed = false;
            _user.user.email.confirmCode = uuid();
            _user.user.save().then((newUser) => {
                client.emit(Protocol.USER_UPDATE_USER, {
                    user: newUser,
                    message: "email updated"
                });
                _user.user = newUser;
                // this.sendConfirmEmail();
            })
        }
    }

    function updateName(data) {
        if (_user.user != null) {
            _user.user.name = data.name;
            _user.user.save().then((newUser) => {
                client.emit(Protocol.USER_UPDATE_USER, {
                    user: newUser,
                    message: "name updated"
                });
                _user.user = newUser;
            })
        }
    };

    function updateBio(data) {
        if (_user.user != null) {
            _user.user.bio = data.bio;
            _user.user.save().then((newUser) => {
                client.emit(Protocol.USER_UPDATE_USER, {
                    user: newUser,
                    message: "bio updated"
                });
                _user.user = newUser;
            })
        }
    };

    function updateAvatar(data) {
        if (_user.user != null) {
            _user.user.avatar.small = data.avatar.small;
            _user.user.avatar.large = data.avatar.large;
            _user.user.save().then((newUser) => {
                client.emit(Protocol.USER_UPDATE_USER, {
                    user: newUser,
                    message: "avatar updated"
                });
                _user.user = newUser;
            })
        }
    };

    function changePassword(data) {
        User.changePassword(_user.user, data.password, data.newPassword, (res) => {
            client.emit(Protocol.USER_CHANGE_PASSWORD, res);
            if (res.success) _user.user = res.user;
        })
    }

    function sendMessage(data) {
        let message = new Message({
            from: _user.id,
            ...data
        });
        message.save().then((message) => {
            messenger.emit(MessageCodes.MESSAGE, message)
        });
    }

    function getMessages(data) {
        var userId = _user.id;
        if (!data.other) {
            Message.find().getAllChats(userId).then((messages) => {
                messages.forEach((message) => {
                    client.emit(Protocol.MESSAGE_SEND, message);
                });
            });
        } else {
            Message.find().getUserChats(userId, data.other).then((messages) => {
                messages.forEach((message) => {
                    this.emit(Protocol.MESSAGE_SEND, message);
                });
            });
        }
    }

    function deleteMessage(data) {
        //todo confirm that user is message owner
        Message.findById(data.messageId).then((message) => {
            if (message.from == this.user.getUserId()) {
                message.content = null;
                message.deleted = true;
                message.save().then((message) => {
                    messenger.emit(MessageCodes.MESSAGE, message)
                });
            }
        })
    }

    function updateMessage(data) {

        Message.findById(data.messageId).then((message) => {
            if (message.from == this.user.getUserId()) {
                message.content = data.content;
                message.updated = true;
                message.save().then((message) => {
                    messenger.emit(MessageCodes.MESSAGE, message)
                });
            }
        })
    }

    function getBlogs(data) {
        Blog.find().byUser(_user.advisorId).then(blogs => blogs.forEach(blog => client.emit(Protocol.BLOG_GET, blog)))
    }

    function updateBlog(data) {
        Blog.findById(data._id).then((blog) => {
            blog.title = data.title;
            blog.document = data.document;
            blog.save().then((blog) =>
                messenger.emit(MessageCodes.BLOG, blog)
            )
        })
    }

    function deleteBlog(data) {
        Blog.findById(data._id).then((blog) => {
            blog.deleted = true;
            blog.save().then((blog) => messenger.emit(MessageCodes.BLOG, blog))
        })
    }

    function sendBlog(data) {
        blog = new Blog();
        blog = Object.assign(blog, {
            userId: _user.advisorId
        }, ...data);
        blog.save().then((blog) => messenger.emit(MessageCodes.BLOG, blog))
    }

    function commentBlog(data) {
        Blog.findById(data._id).then((blog) => {
            data.comment.userId = _user.id;
            blog.comments.push(data.comment);
            blog.save().then((blog) => messenger.emit(MessageCodes.BLOG, blog))
        })
    }

    function removeCommentBlog(data) {
        Blog.findById(data._id, (err, blog) => {
            blog.comments.filter((comment) => comment._id !== data.cId)
            blog.save().then((blog) => messenger.emit(MessageCodes.BLOG, blog))
        })
    }

    function disconnect() {
        logoutAsync().then(dataManager.disconnectClient(client.id));
    }

    function logoutAsync() {
        return new Promise((res) => {
            dataManager.logoutUser(client.id, _user.id).then(bool => {
                if (bool) {
                    _user.user.loggedin = false;
                    _user.user.save().then(u => {
                        _user.user = null
                        res()
                    })
                } else {
                    _user.user = null
                    res()
                }
            })
        })
    }

    function logout() {
        dataManager.logoutUser(client.id, _user.id).then(bool => {
            if (bool) {
                _user.user.loggedin = false;
                _user.user.save().then(u => _user.user = null)
            } else _user.user = null
        })
    }

    client.on(Protocol.MESSAGE_UPDATE, updateMessage);
    client.on(Protocol.MESSAGE_SEND, sendMessage);
    client.on(Protocol.MESSAGE_DELETE, deleteMessage);
    client.on(Protocol.MESSAGE_GET, getMessages);
    client.on(Protocol.BLOG_GET, getBlogs);
    client.on(Protocol.BLOG_UPDATE, updateBlog);
    client.on(Protocol.BLOG_DELETE, deleteBlog);
    client.on(Protocol.BLOG_COMMENT_ADD, commentBlog);
    client.on(Protocol.BLOG_COMMENT_REMOVE, removeCommentBlog);
    client.on(Protocol.BLOG_SEND, sendBlog);
    client.on(Protocol.USER_LOGIN, login);
    client.on(Protocol.USER_REGISTER, register);
    client.on(Protocol.USER_UPDATE_BIO, updateBio);
    client.on(Protocol.USER_UPDATE_NAME, updateName);
    client.on(Protocol.USER_UPDATE_EMAIL, updateEmail);
    client.on(Protocol.USER_UPDATE_AVATAR, updateAvatar);
    client.on(Protocol.USER_CHANGE_PASSWORD, changePassword);
    client.on(Protocol.STUDENT_UPDATE, updateStudent);
    client.on(Protocol.STUDENT_GET, sendStudent);
    client.on(Protocol.USER_LOGOUT, logout);
    client.on(Protocol.USER_FIND, findUsers);
    client.on(Protocol.USER_GET, getUser);
    client.on(Protocol.USER_GET_ADVISOR, getAdvisor);
    client.on(Protocol.DISCONNECT, disconnect);

}

module.exports = clientHandler;
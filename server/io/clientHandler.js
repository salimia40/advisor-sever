const uuid = require('uuid'),
    log = require("../log/log"),
    User = require('../models/user'),
    Message = require('../models/message'),
    Student = require('../models/student'),
    Group = require('../models/group'),
    Member = require('../models/member'),
    Blog = require('../models/blog'),
    Queue = require('../models/queue'),
    events = require('events'),
    Protocol = require('./protocol'),
    Comment = require('../models/comment'),
    GroupEvent = require('../models/gEvent'),
    GroupPost = require('../models/groupPost'),
    GroupComment = require('../models/gComment')

/**
 * @class ClientData 
 * saves info for each socket client
 */
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

/**
 * @class DataManager
 * keeps track of all clients
 */
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
        console.log(this)
        console.log(this.clientDatas)
        var clientDatasS = this.clientDatas.filter((c) => c.userId === userId);
        return new Promise((res) => {
            var clientData = clientDatasS.find((c) => c.clientId === clientId);
            console.log(`nomber of clients ${clientDatasS.length}`)
            clientData.login(false, userId);
            res(!(clientDatasS.length > 1))
        })
    }

    disconnectClient(clientId) {
        this.clientDatas = this.clientDatas.filter((c) => c.clientId !== clientId);
    }

    callUser(action) {

        var clientDatas = this.clientDatas.filter((c) => c.userId === action.userId);
        clientDatas.forEach(clientData => clientData.oncall(action));

    }
}

const dataManager = new DataManager();
const messenger = new events.EventEmitter();

/**
 * @constant codes for messenger emmiter
 */
const MessageCodes = {
    MESSAGE: 'message',
    BLOG: 'blog',
    MEMBER: 'member',
    NOTIFICATION: 'notification',
    groupDeletion: "groupDeletion"
}

/**
 * @constant codes for notification types
 */
const NotificationCodes = {
    ADDED: 'added',
    REMOVED: "removed",
    Group_deleted: "group deleted",
    Blog: "blog",
    Blog_comment: "blog/comment",
    Post: "post",
    Post_edit: "post/edit",
    Post_comment: "post/comment",
}

/**
 * @param message
 * @event
 * if user is online it sends the message
 * or saves it in que so to be resived onlogin
 */
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

/**
 * @param member
 * @event
 * if user is online it sends the member
 * or saves it in queue so to be resived onlogin
 */
messenger.on(MessageCodes.MEMBER, (member) => {
    User.isOnline(member.userId).then(bool => {
        if (bool) {
            dataManager.callUser({
                type: Protocol.ActionTypes.member,
                memberId: member.id
            })
        } else {
            queueMember(member.userId, member.id)
        }
    })
})

/**
 * @param message
 * @event sends blog to all students 
 */
messenger.on(MessageCodes.BLOG, blog => {
    User.find().students(blog.userId).then(users => {
        var notification = {
            type: NotificationCodes.Blog,
            blogId: blog.id
        }
        users.forEach(user => {
            if (user.isOnline) {
                dataManager.callUser({
                    type: Protocol.ActionTypes.blog,
                    userId: user.id,
                    blogId: blog.id
                })
                dataManager.callUser({
                    type: Protocol.ActionTypes.notify,
                    notification: notification
                })

            } else {
                queueNotification(userId, notification)
                queueBlog(user.id, blog.id)
            };

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

/**
 * @param userId
 * @param notification
 * @event sends notification to coresponding user
 */
messenger.on(MessageCodes.NOTIFICATION, (userId, notification) => {
    User.isOnline(userId).then(bool => {
        if (bool) return dataManager.callUser({
            type: Protocol.ActionTypes.notify,
            notification: notification
        })
        else return queueNotification(userId, notification);
    })
})

/**
 * @event notifies all members that group has been deleted
 */
messenger.on(MessageCodes.groupDeletion, (ownerId, groupId) => {
    Member.find({
        groupId: groupId
    }).then(ms => ms.forEach(m => {
        User.isOnline(m.userId).then(bool => {
            var notification = {
                type: NotificationCodes.Group_deleted,
                userId: ownerId,
                groupId: m.groupId
            }
            if (bool) return dataManager.callUser({
                type: Protocol.ActionTypes.notify,
                notification: notification
            })
            else return queueNotification(m.userId, notification);
        })
        GroupComment.deleteMany({
            memberId: m.id
        }).exec()
        Member.findByIdAndDelete(m.id);
    }))
})

function queueNotification(uid, n) {
    Queue.getUserQueue(uid).then(queue => {
        if (!queue) {
            queue = new Queue({
                userId: uid
            })
            queue.save();
        }
        if (!queue.notifications) queue.blogs = [n]
        else queue.notifications.push(n)
        queue.save();
    })
}

function queueBlog(uid, blogId) {
    Queue.getUserQueue(uid).then(queue => {
        if (!queue) {
            queue = new Queue({
                userId: uid
            })
            queue.save();
        }
        if (!queue.blogs) queue.blogs = [blogId]
        else queue.blogs.push(blogId)
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
        if (!queue.messages) queue.messages = [messageId]
        else queue.messages.push(messageId)
        queue.save();
    })
}

function queueMember(uid, mid) {
    Queue.getUserQueue(uid).then(queue => {
        if (!queue) {
            queue = new Queue({
                userId: uid
            })
            queue.save();
        }
        if (!queue.members) queue.members = [mid]
        else queue.members.push(mid)
        queue.save();
    })
}

/**
 * @constant codes for group events
 */
const groupEvents = {
    joined: 'joined',
    left: 'left',
    added: 'added',
    removed: 'removed',
    created: 'created',
    updated: 'updated',
}

/**
 * 
 * @param {String} e event code
 * @param {*} gid GTOUP ID
 * @param {*} subUser who did
 * @param {*} obUser on who
 */
function recordEvent(e, gid, subUser, obUser) {
    var ge = new GroupEvent({
        groupId: gid,
        subUser: subUser,
        obUser: obUser,
        event: e
    })
    ge.save()
}

/**
 * keeps user info
 */
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

    /**
     * checks if client has a user
     */
    get loggedin() {
        return this.user != null;
    }
}
/**
 * 
 * @param {*} client 
 * @exports
 */
const clientHandler = (client) => {
    var _user = new USER();
    /**
     * adds client to data manager
     * @callback action calls to user are emmitd here
     * @emits client#MESSAGE_SEND
     * @emits client#BLOG_GET
     * @emits client#GROUP_GET_MEMBERS
     * @emits client#NOTIFICATION
     */
    dataManager.addClient(client.id, (action) => {
        switch (action.type) {
            case Protocol.ActionTypes.message:
                Message.findById(action.messageId).then(message => {
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

            case Protocol.ActionTypes.notify:
                client.emit(Protocol.NOTIFICATION, notification)
                return;

            case Protocol.ActionTypes.member:
                Member.findById(action.memberId).then(m => client.emit(Protocol.GROUP_GET_MEMBERS, m))
                return;
            default:
                return;
        }
    })

    /**
     * login req
     * 
     * @param {Object} data 
     * @requires data.username
     * @requires data.pasword
     * 
     * @emits cilent#USER_LOGIN{success,message,user}
     */
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

    /**
     * sends all queued docs to client
     * 
     * @emits client#MESSAGE_SEND
     * @emits client#BLOG_GET
     * @emits client#GROUP_GET_MEMBERS
     * @emits client#NOTIFICATION
     */
    function onLogin() {
        dataManager.loginClient(client.id, _user.id);
        Queue.getUserQueue(_user.id).then(queue => {
            if (!queue) return;
            console.info(queue)
            if (queue.messages) {
                if (queue.messages.length !== 0)
                    queue.messages.forEach(mId => Message.findById(mId).then((message) => {
                        message.state.received = true;
                        message.save();
                        client.emit(Protocol.MESSAGE_SEND, message)
                    }))
            }
            if (queue.blogs) {
                if (queue.blogs.length !== 0)
                    queue.blogs.forEach(bId => Blog.findById(bId).then((b) =>
                        client.emit(Protocol.BLOG_GET, b)
                    ))
            }
            if (queue.members) {
                if (queue.members.length !== 0)
                    queue.members.forEach(mId => Member.findById(mId).then((m) =>
                        client.emit(Protocol.GROUP_GET_MEMBERS, m)
                    ))
            }
            if (queue.notifications) {
                if (queue.notifications.length !== 0)
                    queue.notifications.forEach(n =>
                        client.emit(Protocol.NOTIFICATION, n)

                    )
            }

            queue.blogs = [];
            queue.messages = [];
            queue.members = [];
            queue.notifications = [];

            queue.save();
        })
    }

    /**
     * register req
     * 
     * @param {Object} data 
     * @requires data.username
     * @requires data.password
     * @requires data.email
     * @requires data.role
     * @requires data.name
     * 
     * @emits {success, message,user}
     * 
     * if no user is logged in registerd one logges in
     * 
     */
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

    /**
     * creates a blank queue for user
     * 
     * @param {User} user 
     * @requires user.id
     */
    function createQueue(user) {
        var queue = new Queue({
            userId: user.id
        });
        queue.save();
    }

    /**
     * ckecks if user is student
     * @param {User} user 
     * @requires user.role
     * @returns {Boolean}
     */
    function isStudent(user) {
        return user.role === Protocol.UserTypes.student
    }

    /**
     * creates an student doc for user
     * @param {User} user 
     * @emits client#STUDENT_GET
     * 
     */
    function createStudent(user) {
        var student = new Student();
        student.username = user.username;
        student.userId = user._id;
        student.advisorId = user.advisorId;
        student.save().then(st => client.emit(Protocol.STUDENT_GET, st));
    }

    /**
     * 
     * @param {*} data 
     * @requires data.uid   user id of requested student
     * @emits client#STUDENT_GET
     * 
     */
    function sendStudent(data) {
        Student.findOne({
            userId: data.uid
        }).then((student) =>
            client.emit(Protocol.STUDENT_GET, student)
        );
    }

    /**
     * 
     * @param {*} data student document fields
     * @emits client#STUDENT_GET
     */
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

    /**
     * 
     * @param {*} data 
     * @requires data.querry
     * @emits client#USER_GET
     * 
     */
    function findUsers(data) {
        User.findUsers(data.querry).then((users) => {
            client.emit(Protocol.USER_GET, users);
        })
    }

    /**
     * 
     * @param {*} data 
     * @emits client#USER_GET
     * 
     */
    function getAdvisor(data) {
        _user.user.getAdvisor().then((user) => {
            client.emit(Protocol.USER_GET, user);
        })
    }

    /**
     * 
     * @param {*} data 
     * @emits client#USER_GET
     * @requires data.userId
     */
    function getUser(data) {
        User.findById(data.userId).then((user) => {
            client.emit(Protocol.USER_GET, user);
        })
    }

    /**
     * 
     * @param {*} data 
     * @requires data.email
     * @emits client#USER_GET
     * 
     * @login
     * 
     */
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
                // sendConfirmEmail();
            })
        }
    }

    /**
     * 
     * @param {*} data 
     * @requires data.name
     * @emits client#USER_GET
     * 
     * @login
     * 
     */
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

    /**
     * 
     * @param {*} data 
     * @requires data.bio
     * @emits client#USER_GET
     * 
     * @login
     * 
     */
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

    /**
     * 
     * @param {*} data 
     * @requires data.avatar.small
     * @requires data.avatar.large
     * @emits client#USER_GET
     * 
     * @login
     * 
     */
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

    /**
     * 
     * @param {*} data 
     * @requires data.password
     * @requires data.newPassword
     * @emits client#USER_CHANGE_PASSWORD
     * 
     * @login
     * 
     */
    function changePassword(data) {
        User.changePassword(_user.user, data.password, data.newPassword, (res) => {
            client.emit(Protocol.USER_CHANGE_PASSWORD, res);
            if (res.success) _user.user = res.user;
        })
    }

    /**
     * 
     * @param {*} data 
     * @requires data.content
     * @requires data.to
     * @emits messenger#MESSAGE
     * 
     * @login
     * 
     */
    function sendMessage(data) {
        let message = new Message({
            from: _user.id,
            ...data
        });
        message.save().then((message) => {
            messenger.emit(MessageCodes.MESSAGE, message)
        });
    }

    /**
     * 
     * @param {*} data
     * @requires data.other
     * @emits client#MESSAGE_SEND
     * 
     * @login
     * 
     */
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
                    client.emit(Protocol.MESSAGE_SEND, message);
                });
            });
        }
    }

    function deleteMessage(data) {
        //confirms that user is message owner
        Message.findById(data.messageId).then((message) => {
            if (message.from == _user.id) {
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
            if (message.from == _user.id) {
                delete data.messageId
                delete data.deleted
                Object.assign(message,data)
                message.updated = true;
                message.save().then((message) => {
                    messenger.emit(MessageCodes.MESSAGE, message)
                });
            }
        })
    }

    function getBlogs(data) {
        console.log(_user.advisorId)
        Blog.find().byUser(_user.advisorId).then(blogs => blogs.forEach(blog => client.emit(Protocol.BLOG_GET, blog)))
    }

    function updateBlog(data) {
        Blog.findById(data._id).then((blog) => {
            blog.title = data.title;
            blog.document = data.document;
            blog.save().then((blog) => {
                // notify stydents that blog updated
                messenger.emit(MessageCodes.BLOG, blog)
            })
        })
    }

    function deleteBlog(data) {
        Blog.findById(data._id).then((blog) => {
            blog.deleted = true;
            blog.save().then((blog) => messenger.emit(MessageCodes.BLOG, blog))
        })
    }

    function sendBlog(data) {
        var blog = new Blog();
        console.log(data)
        var aid = _user.advisorId
        if (!aid) aid = _user.id
        console.log(aid)
        // Object.assign(blog, ...data);
        blog.title = data.title
        blog.document = data.document
        Object.assign(blog, {
            userId: aid
        });

        blog.save().then((blog) => messenger.emit(MessageCodes.BLOG, blog))
    }

    function commentBlog(data) {
        Blog.findById(data.blogId).then((blog) => {
            data.userId = _user.id;
            // blog.comments.push(data.comment);
            saveComment(data).then(cid => {
                blog.comments.push(cid)
                blog.save().then((blog) =>
                    messenger.emit(MessageCodes.BLOG, blog)
                )
            })
        })
    }

    function saveComment(c) {
        return new Promise((res) => {
            var comment = new Comment(c);
            comment.save().then(nc => res(nc.id))
        })
    }

    function removeCommentBlog(data) {
        Blog.findById(data.bid).then((blog) => {
            blog.comments = blog.comments.filter((comment) => comment !== data.cid)
            deleteComment(data.cid)
            blog.save().then((blog) => messenger.emit(MessageCodes.BLOG, blog))
        })
    }

    function getComments(data) {
        Comment.find().byBlog(data.blogId).then(cs => cs.forEach(
            c => client.emit(Protocol.BLOG_GET_COMMENT, c)
        ))
    }

    function deleteComment(cid) {
        Comment.findByIdAndDelete(cid).exec();
    }

    function disconnect() {
        logoutAsync().then(dataManager.disconnectClient(client.id));
    }

    function logoutAsync() {
        return new Promise((res) => {
            if (_user.loggedin)
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

    function logout(data) {
        if (_user.loggedin)
            dataManager.logoutUser(client.id, _user.id).then(bool => {
                if (bool) {
                    _user.user.loggedin = false;
                    _user.user.save().then(u => _user.user = null)
                } else _user.user = null
            })
    }


    // group actions

    function createGroup(data) {
        Group.findGroup(gata.name).then(g => {
            if (g) {
                // group exists
                client.emit(Protocol.GROUP_CREATE, {
                    success: false,
                    message: 'group already exists'
                })
            }
            var group = new Group({
                ...data
            })
            group.save().then(gr => {
                addOwnerMember(gr._id)
                // send group
                client.emit(Protocol.GROUP_CREATE, {
                    success: true,
                    message: 'group created'
                })
                client.emit(Protocol.GROUP_GET, gr)
                // created event
                recordEvent(groupEvents.created, gr.id, _user.id, null)
            })
        })
    }


    function addOwnerMember(gid) {
        var member = new Member({
            role: Protocol.GroupRoles.owner,
            groupId: gid,
            userId: _user.id
        })
        member.save().then(m => {
            // send member
            client.emit(Protocol.GROUP_GET_MEMBERS, m)
        })
    }

    function updateGroup(data) {
        //check if user can
        if (data.name) {
            Group.findGroup(data.name).then(group => {
                Member.find({
                    userId: _user.id,
                    groupId: group.id
                }).then(m => {
                    if (m.role == Protocol.GroupRoles.owner || m.role == Protocol.GroupRoles.owner) {
                        delete data.name;
                        Object.assign(group, ...data)
                        group.save().then(g => {
                            // send group
                            client.emit(Protocol.GROUP_GET, g)
                            // updated event
                            recordEvent(groupEvents.updated, g.id, _user.id, null)
                        })

                    } else {
                        // cant attemt
                    }
                })
            })
        } else {
            Group.findById(data.gid).then(group => {
                Member.find({
                    userId: _user.id,
                    groupId: group.id
                }).then(m => {
                    if (m.role == Protocol.GroupRoles.owner || m.role == Protocol.GroupRoles.owner) {
                        delete data.name;
                        Object.assign(group, ...data)
                        group.save().then(g => {
                            // send group
                            client.emit(Protocol.GROUP_GET, g)

                            // updated event
                            recordEvent(groupEvents.updated, data.gid, _user.id, null)
                        })

                    } else {
                        // cant attemt
                    }
                })
            })
        }

    }

    function getGroup(data) {
        if (data.gid) {
            Group.findById(data.gid).then(group => {
                // send group
                client.emit(Protocol.GROUP_GET, group)
            })
        }
        if (data.name) {
            Group.findGroup(data.name).then(group => {
                // send group
                client.emit(Protocol.GROUP_GET, group)
            })
        }
    }

    function getAllGroups(data) {
        Member.find({
            userId: _user.id
        }).then(members => {
            members.forEach(m => {
                Group.findById(m.groupId).then(g => {
                    // send group
                    client.emit(Protocol.GROUP_GET, g)
                })
            })
        })
    }

    function findGroup(data) {
        Group.find().search(data.querry).then(gs => gs.forEach(g => {
            // send group
            client.emit(Protocol.GROUP_GET, g)
        }))
    }

    function getGroupOwner(data) {
        Member.findOne({
            groupId: data.gid,
            role: Protocol.GroupRoles.owner
        }).then(owner => {
            // send member
            client.emit(Protocol.GROUP_GET_MEMBERS, m)
        })
    }

    function getGroupMemmbers(data) {
        Member.find({
            groupId: data.gid
        }).then(ms => ms.forEach(m => {
            // send member
            client.emit(Protocol.GROUP_GET_MEMBERS, m)
        }))
    }

    function joinGroup(data) {
        var member = new Member({
            role: Protocol.GroupRoles.member,
            groupId: data.gid,
            userId: _user.id
        })
        member.save().then(m => {
            // send member
            client.emit(Protocol.GROUP_GET_MEMBERS, m)
            // joined event
            recordEvent(groupEvents.joined, data.gid, _user.id, null)
        })
    }

    function addtoGroup(data) {
        var member = new Member({
            role: Protocol.GroupRoles.member,
            groupId: data.gid,
            userId: data.uid
        })
        member.save().then(m => {
            client.emit(Protocol.GROUP_GET_MEMBERS, m)
            // send member for added user next will do it
            // queue member
            messenger.emit(MessageCodes.MEMBER, m)
            // notify user
            messenger.emit(MessageCodes.NOTIFICATION, data.uid, {
                type: NotificationCodes.ADDED,
                userId: _user.id,
                groupId: m.groupId
            })
            // added event
            recordEvent(groupEvents.added, data.gid, _user.id, data.uid)

        })
    }

    function removeMember(data) {
        // only id admin
        Member.find({
            userId: _user.id,
            groupId: data.gid
        }).then(m => {
            if (m.role == Protocol.GroupRoles.owner || m.role == Protocol.GroupRoles.owner) {
                Member.findOneAndDelete({
                    groupId: data.gid,
                    userId: data.uid
                }).exec((err, res) => {
                    if (err) {
                        // failed
                        client.emit(Protocol.GROUP_REMOVE, {
                            success: false,
                            groupId: data.gid,
                            userId: data.uid
                        })
                    } else {
                        // send ok
                        client.emit(Protocol.GROUP_REMOVE, {
                            success: true,
                            groupId: data.gid,
                            userId: data.uid
                        })
                        // notify user
                        messenger.emit(MessageCodes.NOTIFICATION, data.uid, {
                            type: NotificationCodes.REMOVED,
                            userId: _user.id,
                            groupId: m.groupId
                        })
                        // removed event
                        recordEvent(groupEvents.removed, data.gid, _user.id, data.uid)
                    }
                })
            } else {
                // cant attemt
                client.emit(Protocol.GROUP_REMOVE, {
                    success: false,
                    groupId: data.gid,
                    userId: data.uid
                })
            }
        })
    }

    function leaveGroup(data) {
        Member.findOneAndDelete({
            groupId: data.gid,
            userId: _user.id
        }).exec((err, res) => {
            if (err) {
                // failed
                client.emit(Protocol.GROUP_LEAVE, {
                    success: false,
                    groupId: data.gid,
                    userId: _user.id
                })
            } else {
                // send ok
                client.emit(Protocol.GROUP_LEAVE, {
                    success: true,
                    groupId: data.gid,
                    userId: _user.id
                })
                // left event
                recordEvent(groupEvents.left, data.gid, _user.id, null)
            }
        })
    }

    function deleteGroup(data) {
        // only id admin
        Member.find({
            userId: _user.id,
            groupId: data.gid
        }).then(m => {
            if (m.role == Protocol.GroupRoles.owner || m.role == Protocol.GroupRoles.owner) {

                GroupEvent.deleteMany({
                    groupId: data.gid
                }).exec();

                GroupPost.deleteMany({
                    groupId: data.gid
                }).exec();

                // queue deleted members
                // it also deletes comments
                messenger.emit(MessageCodes.groupDeletion, _user.id, m.groupId)

            } else {
                // cant attemt
            }
        })
    }

    function getGroupEvents(data) {
        GroupEvent.find({
            groupId: data.gid
        }).sort({
            date: -1
        }).limit(100).then(events => events.forEach(
            e => {
                // send event
                client.emit(Protocol.GROUP_EVENTS_GET, e)
            }
        ))
    }


    function addGPost(data) {
        var post = new GroupPost({}, {
            ...data
        })
        p.followers = [_user.id]
        post.save().then(p => {
            // send post
            client.emit(Protocol.GROUP_POST_GET, p)

        })
    }

    function editPost(data) {
        GroupPost.findById(data.pid).then(post => {
            delete data.pid
            Object.assign(post, data)
            post.save().then(p => {
                // send post
                client.emit(Protocol.GROUP_POST_GET, p)
                // notify followers
                var noti = {
                    type: NotificationCodes.Post_edit,
                    postId: p.id
                }
                post.followers.forEach(f => messenger.emit(MessageCodes.NOTIFICATION, f, noti))
            })
        })
    }

    function deleteGPost(data) {
        // notify all members to delete post and ites comments
        GroupPost.findById(data.pid).then(post => {
            delete data.pid
            post.deleted = true
            post.save().then(p => {
                // send post
                client.emit(Protocol.GROUP_POST_GET, p)
                // delete post comments
                GroupComment.deleteMany({
                    gPostId: p.id
                })
            })
        })
    }

    function getGpost(data) {
        GroupPost.findById(data.pid).then(post => {
            // send post
            client.emit(Protocol.GROUP_POST_GET, post)
        })
    }

    function getUserGPosts(data) {
        GroupPost.find({
            memberId: data.mid,
            groupId: data.gid,
            deleted: false
        }).then(ps => ps.forEach(p => {
            // send post
            client.emit(Protocol.GROUP_POST_GET, p)
        }))

    }

    function getAllGPosts(data) {
        GroupPost.find({
                groupId: data.gid,
                deleted: false
            }).sort({
                date: -1
            }).limit(200)
            .then(ps => ps.forEach(p => {
                // send post
                client.emit(Protocol.GROUP_POST_GET, p)
            }))

    }


    function addGComment(data) {
        var comment = new GroupComment({
            ...data
        })
        comment.save().then(c => {
            GroupPost.findById(data.gPostId).then(p => {
                // follow post
                if (p.followers.indexOf(_user.id) == -1) p.followers.push(_user.id)
                if (p.comments) p.comments.push(c.id)
                else p.comments = [c.id]
                // notify followers
                var noti = {
                    type: NotificationCodes.Post_comment,
                    postId: p.id
                }
                if (p.followers) p.followers.forEach(f => messenger.emit(MessageCodes.NOTIFICATION, f, noti))

            })
            // send comment
            client.emit(Protocol.GROUP_COMMENT_GET, c)
        })
    }

    function editGCmomment(data) {
        GroupComment.findById(data.cid).then(c => {
            delete data.cid
            Object.assign(c, data)
            c.save().then(co => {
                // send comment
                client.emit(Protocol.GROUP_COMMENT_GET, co)
            })
        })
    }

    function unfollowPost(data) {
        GroupPost.findById(data.pid).then(post => {
            delete data.pid
            var i = post.followers.indexOf(_user.id)
            post.followers.slice(i, i)
            post.save().then(p => {
                client.emit(Protocol.GROUP_POST_GET, p)
            })
        })
    }

    // if already liked unlike the post
    function likePost(data) {
        GroupPost.findById(data.pid).then(post => {
            if (post.likes) {
                var i = post.likes.indexOf(_user.id)
                if (i == -1) post.likes.slice(i, i)
                else post.likes.push(_user.id)
            } else post.likes = [_user.id]
            post.save().then(p => {
                // send p
                client.emit(Protocol.GROUP_POST_GET, p)
            })
        })
    }

    function getGPcomments(data) {
        GroupComment.find({
            gPostId: data.pid
        }).then(cs => cs.forEach(c => {
            // send comment
            client.emit(Protocol.GROUP_COMMENT_GET, c)
        }))
    }

    client.on(Protocol.MESSAGE_UPDATE, updateMessage);
    client.on(Protocol.MESSAGE_SEND, sendMessage);
    client.on(Protocol.MESSAGE_DELETE, deleteMessage);
    client.on(Protocol.MESSAGE_GET, getMessages);
    client.on(Protocol.BLOG_GET, getBlogs);
    client.on(Protocol.BLOG_GET_COMMENT, getComments);
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
    // todo get students
    client.on(Protocol.USER_LOGOUT, logout);
    client.on(Protocol.USER_FIND, findUsers);
    client.on(Protocol.USER_GET, getUser);
    client.on(Protocol.USER_GET_ADVISOR, getAdvisor);
    client.on(Protocol.DISCONNECT, disconnect);

    client.on(Protocol.GROUP_COMMENT_EDIT, createGroup);
    client.on(Protocol.GROUP_UPDATE, updateGroup);
    client.on(Protocol.GROUP_DELETE, deleteGroup);
    client.on(Protocol.GROUP_EVENTS_GET, getGroupEvents);
    client.on(Protocol.GROUP_GET, getGroup);
    client.on(Protocol.GROUP_GET_ALL, getAllGroups);
    client.on(Protocol.GROUP_FIND, findGroup);
    client.on(Protocol.GROUP_JOIN, joinGroup);
    client.on(Protocol.GROUP_ADD, addtoGroup);
    client.on(Protocol.GROUP_LEAVE, leaveGroup);
    client.on(Protocol.GROUP_REMOVE, removeMember);
    client.on(Protocol.GROUP_GET_OWNER, getGroupOwner);
    client.on(Protocol.GROUP_GET_MEMBERS, getGroupMemmbers);
    client.on(Protocol.GROUP_POST_GET, getGpost);
    client.on(Protocol.GROUP_POST_GET_ALL, getAllGPosts);
    client.on(Protocol.GROUP_POST_GET_USER, getUserGPosts);
    client.on(Protocol.GROUP_POST, addGPost);
    client.on(Protocol.GROUP_POST_DELETE, deleteGPost);
    client.on(Protocol.GROUP_POST_EDIT, editPost);
    client.on(Protocol.GROUP_POST_LIKE, likePost);
    client.on(Protocol.GROUP_POST_UNFOLL0W, unfollowPost);
    // client.on(Protocol.GROUP_COMMENT_DELETE, );
    client.on(Protocol.GROUP_COMMENT, addGComment);
    client.on(Protocol.GROUP_COMMENT_EDIT, editGCmomment);
    client.on(Protocol.GROUP_COMMENT_GET, getGPcomments);

}

module.exports = clientHandler;
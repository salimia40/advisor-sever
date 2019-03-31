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

const MessageCodes = {
    MESSAGE: 'message',
    BLOG: 'blog',
    MEMBER: 'member',
    NOTIFICATION: 'notification',
    groupDeletion: "groupDeletion"
}

const NotificationCodes = {
    ADDED: 'added',
    REMOVED: "removed"
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


messenger.on(MessageCodes.NOTIFICATION, (userId, notification) => {
    // todo notification
    User.isOnline(userId).then(bool => {
        if (bool) return dataManager.callUser({
            type: Protocol.ActionTypes.notify,
            notification: notification
        })
        else return queueNotification(userId, notification);
    })
})

messenger.on(MessageCodes.groupDeletion, ownerId, groupId => {
    Member.find({
        groupId: groupId
    }).then(ms => ms.forEach(m => {
        User.isOnline(m.userId).then(bool => {
            var notification = {
                type: NotificationCodes.REMOVED,
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

const groupEvents = {
    joined: 'joined',
    left: 'left',
    added: 'added',
    removed: 'removed',
    created: 'created',
    updated: 'updated',
}

function recordEvent(e, gid, subUser, obUser) {
    var ge = new GroupEvent({
        groupId: gid,
        subUser: subUser,
        obUser: obUser,
        event: e
    })
    ge.save()
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

            case Protocol.ActionTypes.notify:
                client.emit(Protocol.NOTIFICATION, notification)
                return;
                // todo notification
                // todo members
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
            try {
                if (queue.messages.length == 0) return;
                for (var i = (--queue.messages.length); i > 0; i--) {
                    let mId = queue.messages.pop();
                    Message.findById(mId).then((message) => {
                        client.emit(Protocol.MESSAGE_SEND, message);
                    })
                }
                // blogs
                // notifications
                queue.save();
            } catch (error) {

            }
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
        Blog.findById(data.blogId).then((blog) => {
            data.userId = _user.id;
            // blog.comments.push(data.comment);
            saveComment(data).then(cid => {
                blog.comments.push(cid)
                blog.save().then((blog) => messenger.emit(MessageCodes.BLOG, blog))
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
            }
            var group = new Group({
                ...data
            })
            group.save().then(gr => {
                addOwnerMember(gr._id)
                // send group
                // created event
                recordEvent(groupEvents.left, gr.id, _user.id, null)
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
            })
        }
        if (data.name) {
            Group.findGroup(data.name).then(group => {
                // send group
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
                })
            })
        })
    }

    function findGroup(data) {
        Group.find().search(data.querry).then(gs => gs.forEach(g => {
            // send group
        }))
    }

    function getGroupOwner(data) {
        Member.findOne({
            groupId: data.gid,
            role: Protocol.GroupRoles.owner
        }).then(owner => {
            // send member
        })
    }

    function getGroupMemmbers(data) {
        Member.find({
            groupId: data.gid
        }).then(ms => ms.forEach(m => {
            // send member
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
            // send member next will do it
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
                    } else {
                        // send ok

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
            } else {
                // send ok
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
        })
    }

    function editPost(data) {
        GroupPost.findById(data.pid).then(post => {
            delete data.pid
            Object.assign(post, data)
            post.save().then(p => {
                // send post
                // notify followers
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
            })
        })
    }

    function getGpost(data) {
        GroupPost.findById(data.pid).then(post => {
            // send post
        })
    }

    function getUserGPosts(data) {
        GroupPost.find({
            memberId: data.mid,
            groupId: data.gid,
            deleted: false
        }).then(ps => ps.forEach(p => {
            // send post
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
            })
            // send comment
            // notify followers
        })
    }

    function editGCmomment(data) {
        GroupComment.findById(data.cid).then(c => {
            delete data.cid
            Object.assign(c, data)
            c.save().then(co => {
                // send comment
            })
        })
    }

    function unfollowPost(data) {
        GroupPost.findById(data.pid).then(post => {
            delete data.pid
            var i = post.followers.indexOf(_user.id)
            post.followers.slice(i, i)
            post.save().then(p => {})
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
            })
        })
    }

    function getGPcomments(data) {
        GroupComment.find({
            gPostId: data.pid
        }).then(cs => cs.forEach(c => {
            // send comment
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
    client.on(Protocol.USER_LOGOUT, logout);
    client.on(Protocol.USER_FIND, findUsers);
    client.on(Protocol.USER_GET, getUser);
    client.on(Protocol.USER_GET_ADVISOR, getAdvisor);
    client.on(Protocol.DISCONNECT, disconnect);

}

module.exports = clientHandler;
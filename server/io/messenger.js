const uuid = require('uuid'),
    log = require("../log"),
    User = require('../models/user'),
    Member = require('../models/member'),
    Queue = require('../models/queue'),
    events = require('events'),
    Protocol = require('./protocol'),
    GroupEvent = require('../models/gEvent'),
    GroupComment = require('../models/gComment')

module.exports = (clientManager) => {
    const messenger = new events.EventEmitter();
    messenger.MessageCodes = {
        MESSAGE: 'message',
        BLOG: 'blog',
        MEMBER: 'member',
        NOTIFICATION: 'notification',
        groupDeletion: "groupDeletion"
    }

    messenger.NotificationCodes = {
        ADDED: 'added',
        REMOVED: "removed",
        Group_deleted: "group deleted",
        Blog: "blog",
        Blog_comment: "blog/comment",
        Post: "post",
        Post_edit: "post/edit",
        Post_comment: "post/comment",
    }

    messenger.groupEvents = {
        joined: 'joined',
        left: 'left',
        added: 'added',
        removed: 'removed',
        created: 'created',
        updated: 'updated',
    }

    messenger.recordEvent = (event, groupId, subUser, obUser) => {
        let ge = new GroupEvent({
            groupId,
            subUser,
            obUser,
            event
        })
        ge.save()
    }

    messenger.on(messenger.MessageCodes.MESSAGE, async (message) => {
        let isOnline = await User.isOnline(message.to)
        if (isOnline) return clientManager.callUser({
            type: Protocol.ActionTypes.message,
            userId: message.to,
            messageId: message.id
        })
        else queueMessage(message.to, message.id);

        let ifOnline = await User.isOnline(message.from)
        if (ifOnline) return clientManager.callUser({
            type: Protocol.ActionTypes.message,
            userId: message.from,
            messageId: message.id
        })
        else queueMessage(message.from, message.id);

    })

    messenger.on(messenger.MessageCodes.MEMBER, async (member) => {
        let isOnline = await User.isOnline(member.userId)
        if (isOnline) {
            clientManager.callUser({
                type: Protocol.ActionTypes.member,
                memberId: member.id
            })
        } else
            queueMember(member.userId, member.id)

    })


    messenger.on(messenger.MessageCodes.BLOG, async blog => {
        let users = await User.find().students(blog.userId)

        let notification = {
            type: NotificationCodes.Blog,
            blogId: blog.id
        }

        users.forEach(user => {
            if (user.isOnline) {
                clientManager.callUser({
                    type: Protocol.ActionTypes.blog,
                    userId: user.id,
                    blogId: blog.id
                })
                clientManager.callUser({
                    type: Protocol.ActionTypes.notify,
                    notification: notification
                })

            } else {
                queueNotification(userId, notification)
                queueBlog(user.id, blog.id)
            };

        })

        let user = await User.findById(blog.userId)
        if (user.isOnline) {
            clientManager.callUser({
                type: Protocol.ActionTypes.blog,
                userId: user.id,
                blogId: blog.id
            })
        } else queueBlog(user.id, blog.id);

    })

    messenger.on(messenger.MessageCodes.NOTIFICATION, async (userId, notification) => {
        let isOnline = await User.isOnline(userId)
        if (isOnline) return clientManager.callUser({
            type: Protocol.ActionTypes.notify,
            notification: notification
        })
        else return queueNotification(userId, notification);
    })

    messenger.on(MessageCodes.groupDeletion, async (ownerId, groupId) => {
        let ms = await Member.find({
            groupId: groupId
        })
        ms.forEach(async m => {
            let isOnline = await User.isOnline(m.userId)

            let notification = {
                type: NotificationCodes.Group_deleted,
                userId: ownerId,
                groupId: m.groupId
            }
            if (isOnline) return clientManager.callUser({
                type: Protocol.ActionTypes.notify,
                notification: notification
            })
            else return queueNotification(m.userId, notification);
        })
        GroupComment.deleteMany({
            memberId: m.id
        }).exec()
        Member.findByIdAndDelete(m.id);
    })

    return messenger
}

const queueNotification = async (userId, n) => {
    let queue = await Queue.getUserQueue(userId)
    if (!queue) {
        queue = new Queue({
            userId
        })
        queue.save();
    }

    if (!queue.notifications) queue.blogs = [n]
    else queue.notifications.push(n)
    queue.save().exec()

}

const queueBlog = async (userId, blogId) => {
    let queue = await Queue.getUserQueue(userId)
    if (!queue) {
        queue = new Queue({
            userId
        })
        queue = await queue.save().exec();
    }
    if (!queue.blogs) queue.blogs = [blogId]
    else queue.blogs.push(blogId)
    queue.save().exec;

}

const queueMessage = async (userId, messageId) => {
    let queue = await Queue.getUserQueue(userId)
    if (!queue) {
        queue = new Queue({
            userId
        })
        queue = await queue.save().exec();
    }
    if (!queue.messages) queue.messages = [messageId]
    else queue.messages.push(messageId)
    queue.save();

}

const queueMember = async (userId, mid) => {
    let queue = await Queue.getUserQueue(userId)
    if (!queue) {
        queue = new Queue({
            userId
        })
        queue = await queue.save().exec();
    }
    if (!queue.members) queue.members = [mid]
    else queue.members.push(mid)
    queue.save().exec()
}
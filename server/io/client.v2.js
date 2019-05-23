const jwt = require('../jwt')(),
    User = require('../models/user'),
    ClientData = require('./clientData'),
    Queue = require('../models/queue')

module.exports = (io, messenger, clientManager) => {

    return async (client) => {
        console.log(client.id);
        let token = client.handshake.query.token;
        // check auth
        let user = await loginClient(token)
        if (user == undefined) {
            client.on('token', async data => {
                let user = await loginClient(data.token)
                if (user == undefined) return
                else client.userId = user.id
                user.isOnline = true
                user.save().exec()
                onLogin(io, client)
            })
            return
        }
        user.isOnline = true
        user.save().exec()
        client.userId = user.id
        onLogin(io, client, messenger, clientManager)
    }
}

const loginClient = async (token) => {
    if (token == undefined) return undefined
    let auth = jwt.decode(token)
    // checking heath of token
    if (auth.id == undefined || auth.password == undefined) return undefined
    let user = await User.findById(auth.id)
    let isMatch = await user.checkPassword(auth.password)
    if (isMatch) {
        return user
    } else return undefined
}

const onLogin = async (io, client, messenger, clientManager) => {

    let clientData = new ClientData(client.id,
        // on client called
        async (action) => {
            // todo refactor emit codes
            switch (action.type) {
                case Protocol.ActionTypes.message:
                    let message = await Message.findById(action.messageId)
                    message.state.received = true;
                    message.save();
                    client.emit(Protocol.MESSAGE_SEND, message)
                    return;

                case Protocol.ActionTypes.blog:
                    let blog = await Blog.findById(action.blogId)
                    client.emit(Protocol.BLOG_GET, blog)
                    return;

                case Protocol.ActionTypes.notify:
                    client.emit(Protocol.NOTIFICATION, notification)
                    return;

                case Protocol.ActionTypes.member:
                    let m = await Member.findById(action.memberId)
                    client.emit(Protocol.GROUP_GET_MEMBERS, m)

                    return;
                default:
                    return;
            }
        })
    clientData.login(true, client.userId)
    clientManager.putClient(clientData)

    let queue = await Queue.getUserQueue(client.userId)
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

    async function sendMessage(data) {
        let message = new Message({
            from: _user.id,
            ...data
        });
        message = await message.save()
        messenger.emit(messenger.MessageCodes.MESSAGE, message)
    }

    async function getMessages(data) {
        let userId = client.userId;
        let messages;
        if (!data.other) {
            messages = await Message.find().getAllChats(userId)
            messages.forEach((message) => {
                client.emit(Protocol.MESSAGE_SEND, message);
            })
        } else {
            messages = await Message.find().getUserChats(userId, data.other)
            messages.forEach((message) => {
                client.emit(Protocol.MESSAGE_SEND, message);
            })
        }
    }

    async function deleteMessage(data) {
        //confirms that user is message owner
        let message = await Message.findById(data.messageId)
        if (message.from == _user.id) {
            message.content = null;
            message.deleted = true;
            message = await message.save()
            messenger.emit(messenger.MessageCodes.MESSAGE, message)
        }

    }

    async function updateMessage(data) {
        let message = await Message.findById(data.messageId)

        if (message.from == client.userId) {
            delete data.messageId
            delete data.deleted
            Object.assign(message, data)
            message.updated = true;
            message = await message.save()
            messenger.emit(messenger.MessageCodes.MESSAGE, message)
        }
    }

    async function disconnect() {
        let shouldLogout = await clientManager.logoutUser(client.id, client.userId)
        if (shouldLogout) {
            let user = await User.findById(client.userId)
            user.isOnline = false
            user.save.exec()
        }
        clientManager.disconnectClient(client.id)
    }

    async function logout() {
        let shouldLogout = await clientManager.logoutUser(client.id, client.userId)
        if (shouldLogout) {
            let user = await User.findById(client.userId)
            user.isOnline = false
            user.save.exec()
        }
        clientData.login(false,null)
    }
    client.on(Protocol.MESSAGE_UPDATE, updateMessage);
    client.on(Protocol.MESSAGE_SEND, sendMessage);
    client.on(Protocol.MESSAGE_DELETE, deleteMessage);
    client.on(Protocol.MESSAGE_GET, getMessages);
    client.on(Protocol.DISCONNECT, disconnect);
    client.on(Protocol.USER_LOGOUT, logout);
}
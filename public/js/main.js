 // user events
 var protocol = {
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
    GROUP_DELETE: 'group/delete',
    GROUP_GET: 'group/get',
    GROUP_EVENTS_GET: 'group/events/get',
    GROUP_GET_ALL: 'group/get/all',
    GROUP_FIND: 'group/find',
    GROUP_JOIN: 'group/join',
    GROUP_ADD: 'group/add',
    GROUP_LEAVE: 'group/leave',
    GROUP_REMOVE: 'group/remove',
    GROUP_GET_OWNER: 'group/get/owner',
    GROUP_GET_MEMBERS: 'group/get/members',
    GROUP_POST_GET: 'group/post/get',
    GROUP_POST_UNFOLL0W: 'group/post/unfollow',
    GROUP_POST_LIKE: 'group/post/like',
    GROUP_POST_GET_ALL: 'group/post/get/all',
    GROUP_POST_GET_USER: 'group/post/get/user',
    GROUP_POST: 'group/post',
    GROUP_POST_DELETE: 'group/post/delete',
    GROUP_POST_EDIT: 'group/post/edit',
    GROUP_COMMENT: 'group/comment',
    GROUP_COMMENT_GET: 'group/comment/get',
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
    BLOG_GET_COMMENT: 'blog/get/comment',
    BLOG_UPDATE: 'blog/update',
    BLOG_DELETE: 'blog/delete',
    BLOG_COMMENT_ADD: 'blog/comment/add',
    BLOG_COMMENT_REMOVE: 'blog/comment/remove',

    NOTIFICATION: 'notification',

    UserTypes: {
        advisor: 'advisor',
        student: 'student'
    },
    ActionTypes: {
        message: 'message',
        blog: 'blog',
        notify: 'notify',
        member: 'member'
    },
    GroupRoles: {
        owner: 'owner',
        admin: 'admin',
        member: 'member'
    },
    CONNECT: 'connect',
    DISCONNECT: 'disconnect'
}

 // var socket = io('localhost:5000');
 var socket = io();

 socket.on(protocol.CONNECTION, function () {
     console.log('connected')
 });

 socket.on(protocol.USER_LOGIN, function (data) {
     console.log('logged in')
     console.log(data)
     if (data.success) {
         // socket.emit(protocol.USER_UPDATE_BIO,{bio:'this is where i end'});
         // socket.emit(protocol.USER_UPDATE_EMAIL,{email:'sad@ness.com'});
         // socket.emit(protocol.USER_UPDATE_AVATAR,{avatar:{small:'small.jpg',large:'larg.jpg'}});
         // socket.emit(protocol.USER_REGISTER,{
         //     username:'love',
         //     name:'barai',
         //     email:'asara@love.com',
         //     role:'student',
         //     password:'love'
         // })

         // socket.emit(USER_FIND,{querry:'rahilars76'})
        //  socket.emit(protocol.USER_GET_ADVISOR,{})
        //  socket.emit(protocol.USER_GET,{userId:data.user.advisorId})
        //  socket.emit(protocol.MESSAGE_GET,{})
        // socket.emit(protocol.BLOG_GET,{})
        socket.emit(protocol.BLOG_SEND,{
            title: 'a test blog',
            document: 'a test'
        })
     }
 });

 socket.on(protocol.USER_FIND, function (data) {
     // console.log('logged in')
     console.log(data)
 });

 socket.on(protocol.BLOG_GET, function (data) {
     console.log('blog recieved')
     console.log(data)
 });

 socket.on(protocol.USER_GET, function (data) {
     console.log('a user reseived')
     console.log(data)
 });

 socket.on(protocol.MESSAGE_GET, function (data) {
     console.log('a message resived')
     console.log(data)
     
 });

 socket.on(protocol.MESSAGE_SEND, function (data) {
     console.log('message send')
     console.log(data)
    //  data.state.received = true
     data.messageId = data._id
    //  socket.emit(protocol.MESSAGE_UPDATE,data)
     socket.emit(protocol.MESSAGE_DELETE,data)
 });

 socket.on(protocol.USER_GET_ADVISOR, function (data) {
     console.log('advisor resived')
     console.log(data)
 });

 socket.on(protocol.USER_REGISTER_Student, function (data) {
     // console.log('logged in')
     console.log(data)
 });

 socket.on(protocol.USER_UPDATE_USER, function (data) {
     console.log(data);
 })

 // socket.emit(protocol.USER_REGISTER,{username:'shasprs',password:'rahil19',email:'puyaars@gmail.com',name:'aria',role:'advisor'})
 socket.emit(protocol.USER_LOGIN, {
    //  username: 'love',
    //  password: 'love'
     username: 'puyaars',
     password: 'rahil19'
 })
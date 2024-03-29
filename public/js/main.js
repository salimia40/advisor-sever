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



 const baseURL = `${window.location.hostname}:${window.location.port}/v2`

 
 console.log(baseURL)
 var token = '8be682cbdcfa467f1e00cb611de2a667f4db89b26931816f2907cd3a1401c376682fab17163d717523e9b26ecd9436d2';
 var socket2

 getURL = () => token ? `${baseURL}?token=${token}` : baseURL
 
 var url = getURL()
 console.log(url)
 socket2 = io(url);


 socket2.on(protocol.CONNECT, function () {
     console.log('connected to version2')
 });
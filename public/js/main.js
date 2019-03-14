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
     // message events
     MESSAGE_SEND: 'message/send',
     MESSAGE_GET: 'message/get',
     MESSAGE_UPDATE: 'message/update',
     MESSAGE_DELETE: 'message/delete',
     //student events
     STUDENT_GET: 'student/get',
     STUDENT_UPDATE: 'student/update',
     // enums
     UserTypes: {
         advisor: 'advisor',
         student: 'student'
     },
     ActionTypes: {
         message: 'message'
     },
     // io events
     DISCONNECT: 'disconnect',
     CONNECTION: 'connect',

 }

 var USER_FIND = 'user/find';
 var USER_GET = 'user/get';
 var USER_GET_ADVISOR = 'user/get/advisor';

 var MESSAGE_SEND = 'message/send';
 var MESSAGE_GET = 'message/get';
 var MESSAGE_UPDATE = 'message/update';
 var MESSAGE_DELETE = 'message/delete';

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
         // socket.emit(USER_GET_ADVISOR,{})

         socket.emit(MESSAGE_SEND, {
             to: '5c5bb5ee5b5c9119e88c092d',
             content: {
                 text: 'hi',
             }
         })
     }
 });

 socket.on(USER_FIND, function (data) {
     // console.log('logged in')
     console.log(data)
 });

 socket.on(MESSAGE_GET, function (data) {
     // console.log('logged in')
     console.log(data)
 });

 socket.on(MESSAGE_SEND, function (data) {
     // console.log('logged in')
     console.log(data)
 });

 socket.on(USER_GET_ADVISOR, function (data) {
     // console.log('logged in')
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
     username: 'love',
     password: 'love'
    //  username: 'puyaars',
    //  password: 'rahil19'
 })
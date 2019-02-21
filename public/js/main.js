 // user events
 var protocol = {
    USER_LOGIN: 'user/login',
    USER_REGISTER: 'user/register',
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
    UserTypes: { advisor: 'advisor', student: 'student' },
    ActionTypes: { message: 'message' },
    // io events
    DISCONNECT: 'disconnect',
    CONNECTION: 'connect',

}

// var socket = io('localhost:5000');
var socket = io();

socket.on(protocol.CONNECTION, function(){
    console.log('connected')
});

socket.on(protocol.USER_LOGIN, function(data){
    console.log('logged in')
    console.log(data)
});

socket.on('test', function(data){
    // console.log('logged in')
    console.log(data.msg.toString())
});

// socket.emit(protocol.USER_REGISTER,{username:'shasprs',password:'rahil19',email:'puyaars@gmail.com',name:'aria',role:'advisor'})
socket.emit(protocol.USER_LOGIN,{username:'puyaars',password:'rahil19'})

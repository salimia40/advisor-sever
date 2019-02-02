const log = require('../log/log');
const User = require('../models/user');

/*********************************
 TODO list:
    simple Login and register for advisors
    // add email confirmation and password recovery
    student creation and management function for advisors
    post and comment that advisors can create posts and sudents resive their adisor's post and both can comment
    student information updates
    comment replies 
    advisor-student chat
    group chats
*********************************/

const users = new Map();
const LOGIN = 'LOGIN';
const login = (client,data) => {
    log.info(`new login attempt by ${client.id} data: ${data}`)
    let username = data.username;
    let password = data.password;
    User.getUserByUsername(username,(err,user) =>{
        if (err) return client.emit(LOGIN,{success:false,message:'user not found'});
        User.comparePassword(password,User.password,(err,isMatch) => {
            if (err) return client.emit(LOGIN,{success:false,message:'incorrect password'});
            if (!isMatch) return client.emit(LOGIN,{success:false,message:'incorrect password'});
            if (isMatch) {
                user.isOnline = true;
                user.save();
                users.set(client.id,user);
                log.info(`user registered:   ${client.id}    ${user}`);
                return  client.emit(LOGIN,{success:true,message:'login successful',user:user});
            }
        });
    })
}

const REGISTER = 'REGISTER';
const register = (client,data) => {
    log.info(`a register attempt ${data}`);
    let username = data.username; 
    let email = data.email; 
    let password = data.password; 
    let role = data.role; 
    let name = data.name;
    
    let user = new User();
    user.username = username;
    user.email = email;
    user.password = password;
    user.name = name;
    user.role = role;
    User.createUser(user,(newUser)=>{
        newUser.isOnline = true;
        newUser.save();
        newUser.set(client.id,user);
        log.info(`user logged in:   ${client.id}    ${newUser}`);
        client.emit(REGISTER,{success:true,user:newUser});
    })
}

const disconnect = (client) => {
    if(users.has(client.id)){
        let user =users.get(client.id);
        user.isOnline = false;
        log.info(`user disconnected:    ${user}`);
        user.save();
        users.delete(client.id);
    }
    log.info(`client disconnected:  ${client.id}`);
}

connectionListener = (client)=> {
    log.info(`new client connected: ${client.id}`);
    client.on(LOGIN,(data)=>login(client,data));
    client.on(REGISTER,(data)=>register(client,data));
    client.on('disconnect',()=> disconnect(client));
};

module.exports = connectionListener;
const log = require('../log/log');
const User = require('../models/user');
const Protocol = require('./protocol');
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

const login = (client,data) => {
    log.info(`new login attempt by ${client.id} data: ${data}`);
    let username = data.username;
    let password = data.password;

    User.getUserByUsername(username,(err,user) =>{
        if (err) return client.emit(Protocol.LOGIN,{success:false,message:'user not found'});
        User.comparePassword(password,user.password,(err,isMatch) => {
            if (err) return client.emit(Protocol.LOGIN,{success:false,message:'incorrect password'});
            if (!isMatch) return client.emit(Protocol.LOGIN,{success:false,message:'incorrect password'});
            if (isMatch) {
                user.isOnline = true;
                user.save();
                users.set(client.id,user);
                log.info(`user registered:   ${client.id}    ${user}`);
                return  client.emit(Protocol.LOGIN,{success:true,message:'login successful',user:user});
            }
        });
    })
};

const createInfoRecord = (user) => {
  // todo
};


const register = (client,data) => {
    log.info(`a register attempt from client:   ${client.id}`);

    let user = new User();
    user.username = data.username;
    user.email = data.email;
    user.password = data.password;
    user.name = data.name;
    user.role = data.role;
    user.advisorId = data.advisorId;

    log.info(`a register attempt ${user}`);
    User.getUserByUsername(data.username,(err,existingUser) =>{
        if (err) return client.emit(Protocol.LOGIN,{success:false,message:'database error'}); 
        if (existingUser) return client.emit(Protocol.LOGIN,{success:false,message:'user already exists'});
        else {
            User.createUser(user,(err,newUser)=>{
                if (err)  {
                    log.info(`user error:   ${err.message}`);
                    client.emit(Protocol.LOGIN,{success:false,message:'database error please try again'})
                }
                newUser.isOnline = true;
                newUser.save();
                users.set(client.id,user);
                log.info(`user logged in:   ${client.id} ${newUser}`);
                client.emit(Protocol.LOGIN,{success:true,user:newUser,message:'user created and logged in'});
                createInfoRecord(newUser);
            })
        }
    });
};

const disconnect = (client) => {
    if(users.has(client.id)){
        let user =users.get(client.id);
        user.isOnline = false;
        log.info(`user disconnected:    ${user}`);
        user.save();
        users.delete(client.id);
    }
    log.info(`client disconnected:  ${client.id}`);
};

const updateEmail = (client,data) => {
    let user = users.get(client.id);
    user.email = data.email;
    user.save((err,newUser)=>{
        client.emit(Protocol.UPDATE_USER,{user:newUser,message:"email updated"});
    })
};

const updateName = (client,data) => {
    let user = users.get(client.id);
    user.name = data.name;
    user.save((err,newUser)=>{
        client.emit(Protocol.UPDATE_USER,{user:newUser,message:"nae updated"});
    })
};

const updateBio = (client,data) => {
    let user = users.get(client.id);
    user.bio = data.bio;
    user.save((err,newUser)=>{
        client.emit(Protocol.UPDATE_USER,{user:newUser,message:"bio updated"});
    })
};

const updateAvatar = (client,data) => {
    let user = users.get(client.id);
    user.avatar = data.avatar;
    user.save((err,newUser)=>{
        client.emit(Protocol.UPDATE_USER,{user:newUser,message:"avatar updated"});
    })
};

const changePassword = (client,data) => {
    let user = users.get(client.id);
    User.changePassword(user,data.password,data.newPassword,(res) => {
        client.emit(Protocol.CHANGE_PASSWORD,res);
        if(res.success) users.set(client.id,res.user);
    })
};

const logout = (client) => {
    let user = users.get(client.id);
    user.isOnline = false;
    user.save();
    users.delete(client.id);
};

connectionListener = (client)=> {
    log.info(`new client connected: ${client.id}`);
    client.on(Protocol.LOGIN,(data)=>login(client,data));
    client.on(Protocol.REGISTER,(data)=>register(client,data));
    client.on(Protocol.UPDATE_BIO,(data)=>updateBio(client,data));
    client.on(Protocol.UPDATE_NAME,(data)=>updateName(client,data));
    client.on(Protocol.UPDATE_EMAIL,(data)=>updateEmail(client,data));
    client.on(Protocol.UPDATE_AVATAR,(data)=>updateAvatar(client,data));
    client.on(Protocol.CHANGE_PASSWORD,(data)=>changePassword(client,data));
    client.on(Protocol.LOGOUT,(ignored)=> logout(client));
    client.on('disconnect',()=> disconnect(client));
};

module.exports = connectionListener;



// to get key by value
// let people = new Map();
// people.set('1', 'jhon');
// people.set('2', 'jasmein');
// people.set('3', 'abdo');

// let jhonKeys = [...people.entries()]
//         .filter(({ 1: v }) => v === 'jhon')
//         .map(([k]) => k);
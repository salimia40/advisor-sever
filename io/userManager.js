const uuid = require('uuid');
const log = require("../log/log");
const User = require("../models/user");
const Protocol = require("./protocol");


class UserManager {

    constructor(client,onLogin){
        this.client = client;
        this.onLogin = onLogin;
        this.user = null;
        this.client.on(Protocol.USER_USER_LOGIN, this.login);
        this.client.on(Protocol.USER_USER_REGISTER,  this.register);
        this.client.on(Protocol.USER_USER_UPDATE_BIO,  this.updateBio);
        this.client.on(Protocol.USER_USER_UPDATE_NAME,  this.updateName);
        this.client.on(Protocol.USER_USER_UPDATE_EMAIL,  this.updateEmail);
        this.client.on(Protocol.USER_USER_UPDATE_AVATAR,  this.updateAvatar);
        this.client.on(Protocol.USER_USER_CHANGE_PASSWORD,  this.changePassword);
        this.client.on(Protocol.USER_USER_LOGOUT, this.logout);
    }

    logout = (ignored) => {
        this.onLogin(false,this.user);
        this.user.isOnline = false;
        this.user.save();
        this.user = null;
    };

    
    login = (data) => {
        log.info(`new login attempt by ${this.client.id} data: ${data}`);
        let username = data.username;
        let password = data.password;

        User.findByUsername(username, (err, user) => {
            if (err) return this.client.emit(Protocol.USER_LOGIN, { success: false, message: 'user not found' });
            user.checkPassword(password, (err, isMatch) => {
                if (err) return this.client.emit(Protocol.USER_LOGIN, { success: false, message: 'incorrect password' });
                if (!isMatch) return this.client.emit(Protocol.USER_LOGIN, { success: false, message: 'incorrect password' });
                // if (user.isOnline) return this.client.emit(Protocol.USER_LOGIN, { success: false, message: 'already logged in some where else'});
                if (isMatch) {
                    user.isOnline = true;
                    user.save();
                    this.user = newUser;
                    log.info(`user registered:   ${this.client.id}    ${user}`);
                    return this.client.emit(Protocol.USER_LOGIN, { success: true, message: 'login successful', user: user });
                }
            });
        })
    };

    onLogginEvent = () => {
        this.onLogin(true,this.user);
    }


    createInfoRecord = () => {
        // todo
    };


    /** @namespace data.username */
    /** @namespace data.password */
    /** @namespace data.email */
    /** @namespace data.name */
    /** @namespace data.role */
    /** @namespace data.advisorId */
    register = (data) => {
        log.info(`a register attempt from this.client:   ${this.client.id}`);

        let user = new User();
        user.username = data.username;
        user.email = {email:data.email,confirmed:false,confirmCode:uuid()};
        user.password = data.password;
        user.name = data.name;
        user.role = data.role;
        user.advisorId = data.advisorId;

        log.info(`a register attempt ${user}`);
        User.findByUsername(data.username, (err, existingUser) => {
            if (err) return this.client.emit(Protocol.USER_LOGIN, { success: false, message: 'database error' });
            if (existingUser) return this.client.emit(Protocol.USER_LOGIN, { success: false, message: 'user already exists' });
            else {
                user.createUser((err, newUser) => {
                    if (err) {
                        log.info(`user error:   ${err.message}`);
                        this.client.emit(Protocol.USER_LOGIN, { success: false, message: 'database error please try again' })
                    }
                    newUser.isOnline = true;
                    newUser.save();
                    this.user = newUser;
                    this.sendConfirmEmail();
                    log.info(`user logged in:   ${this.client.id} ${newUser}`);
                    this.client.emit(Protocol.USER_LOGIN, { success: true, user: newUser, message: 'user created and logged in' });
                    this.createInfoRecord();
                })
            }
        });
    };


    /** @namespace data.email */
    updateEmail = (data) => {
        this.user.email.email = data.email;
        this.user.email.confirmed = false;
        this.user.email.confirmCode = uuid();
        this.user.save((err, newUser) => {
            this.client.emit(Protocol.USER_UPDATE_USER, { user: newUser, message: "email updated" });
            this.user = newUser;
            this.sendConfirmEmail();
        })
    };

    sendConfirmEmail = () => {
        //todo
    }


    /** @namespace data.name */
    updateName = (data) => {
        this.user.name = data.name;
        this.user.save((err, newUser) => {
            this.client.emit(Protocol.USER_UPDATE_USER, { user: newUser, message: "nae updated" });
            this.user = newUser;
        })
    };

    /** @namespace data.bio */
    updateBio = (data) => {
        this.user.bio = data.bio;
        this.user.save((err, newUser) => {
            this.client.emit(Protocol.USER_UPDATE_USER, { user: newUser, message: "bio updated" });
            this.user = newUser;
        })
    };

    /** @namespace data.avatar.small */
    /** @namespace data.avatar.large */
    updateAvatar = (data) => {
        this.user.avatar.small = data.avatar.small;
        this.user.avatar.large = data.avatar.large;
        this.user.save((err, newUser) => {
            this.client.emit(Protocol.USER_UPDATE_USER, { user: newUser, message: "avatar updated" });
            this.user = newUser;
        })
    };

    /** @namespace data.newPassword */
    /** @namespace data.password */
    changePassword = (data) => {
        this.user.changePassword(data.password, data.newPassword, (res) => {
            this.client.emit(Protocol.USER_CHANGE_PASSWORD, res);
            if (res.success) this.user = res.user;
        })
    };

    getUserId = () => this.user.id;
    getUser = () => this.user;
    isAdvisor = () => this.user.role === Protocol.UserTypes.advisor;
    isLoggedin = () => this.user !== null;


}

module.exports = UserManager;
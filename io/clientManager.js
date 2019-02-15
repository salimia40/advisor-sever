const log = require("../log/log");
const User = require("../models/user");
const Protocol = require("./protocol");

class Client {

    constructor(client, onDisconnect) {
        this.client = client;
        this.onDisconnect = onDisconnect;
        this.user = null;
        this.client.on(Protocol.LOGIN, (data) => this.login(this.client, data));
        this.client.on(Protocol.REGISTER, (data) => this.register(this.client, data));
        this.client.on(Protocol.UPDATE_BIO, (data) => this.updateBio(this.client, data));
        this.client.on(Protocol.UPDATE_NAME, (data) => this.updateName(this.client, data));
        this.client.on(Protocol.UPDATE_EMAIL, (data) => this.updateEmail(this.client, data));
        this.client.on(Protocol.UPDATE_AVATAR, (data) => this.updateAvatar(this.client, data));
        this.client.on(Protocol.CHANGE_PASSWORD, (data) => this.changePassword(this.client, data));
        this.client.on(Protocol.LOGOUT, (ignored) => this.logout(this.client));
        this.client.on('disconnect', () => {
            this.disconnect(this.client);
            this.onDisconnect();
        });
    }

    login = (data) => {
        log.info(`new login attempt by ${this.client.id} data: ${data}`);
        let username = data.username;
        let password = data.password;

        User.findByUsername(username, (err, user) => {
            if (err) return this.client.emit(Protocol.LOGIN, { success: false, message: 'user not found' });
            user.checkPassword(password, (err, isMatch) => {
                if (err) return this.client.emit(Protocol.LOGIN, { success: false, message: 'incorrect password' });
                if (!isMatch) return this.client.emit(Protocol.LOGIN, { success: false, message: 'incorrect password' });
                if (user.isOnline) return this.client.emit(Protocol.LOGIN, { success: false, message: 'already logged in some where else'});
                if (isMatch) {
                    user.isOnline = true;
                    user.save();
                    this.user = newUser;
                    log.info(`user registered:   ${this.client.id}    ${user}`);
                    return this.client.emit(Protocol.LOGIN, { success: true, message: 'login successful', user: user });
                }
            });
        })
    };

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
        user.email = data.email;
        user.password = data.password;
        user.name = data.name;
        user.role = data.role;
        user.advisorId = data.advisorId;

        log.info(`a register attempt ${user}`);
        User.findByUsername(data.username, (err, existingUser) => {
            if (err) return this.client.emit(Protocol.LOGIN, { success: false, message: 'database error' });
            if (existingUser) return this.client.emit(Protocol.LOGIN, { success: false, message: 'user already exists' });
            else {
                user.createUser((err, newUser) => {
                    if (err) {
                        log.info(`user error:   ${err.message}`);
                        this.client.emit(Protocol.LOGIN, { success: false, message: 'database error please try again' })
                    }
                    newUser.isOnline = true;
                    newUser.save();
                    this.user = newUser;
                    log.info(`user logged in:   ${this.client.id} ${newUser}`);
                    this.client.emit(Protocol.LOGIN, { success: true, user: newUser, message: 'user created and logged in' });
                    this.createInfoRecord();
                })
            }
        });
    };


    /** @namespace data.email */
    updateEmail = (data) => {
        this.user.email = data.email;
        this.user.save((err, newUser) => {
            this.client.emit(Protocol.UPDATE_USER, { user: newUser, message: "email updated" });
            this.user = newUser;
        })
    };


    /** @namespace data.name */
    updateName = (data) => {
        this.user.name = data.name;
        this.user.save((err, newUser) => {
            this.client.emit(Protocol.UPDATE_USER, { user: newUser, message: "nae updated" });
            this.user = newUser;
        })
    };

    /** @namespace data.bio */
    updateBio = (data) => {
        this.user.bio = data.bio;
        this.user.save((err, newUser) => {
            this.client.emit(Protocol.UPDATE_USER, { user: newUser, message: "bio updated" });
            this.user = newUser;
        })
    };

    /** @namespace data.avatar */
    updateAvatar = (data) => {
        this.user.avatar = data.avatar;
        this.user.save((err, newUser) => {
            this.client.emit(Protocol.UPDATE_USER, { user: newUser, message: "avatar updated" });
            this.user = newUser;
        })
    };

    /** @namespace data.newPassword */
    /** @namespace data.password */
    changePassword = (data) => {
        this.user.changePassword(data.password, data.newPassword, (res) => {
            this.client.emit(Protocol.CHANGE_PASSWORD, res);
            if (res.success) this.user = res.user;
        })
    };

    disconnect = () => {
        if (this.user !== null) {
            this.logout();
        }
        log.info(`this.client disconnected:  ${this.client.id}`);
    };


    logout = () => {
        this.user.isOnline = false;
        this.user.save();
        this.user = null;
    };

}

module.exports = Client;
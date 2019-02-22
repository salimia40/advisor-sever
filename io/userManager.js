const uuid = require('uuid');
const log = require("../log/log");
const User = require("../models/user");
const Queue = require("../models/queue");
const Student = require("../models/student");
const Protocol = require("./protocol");

class UserManager {

    constructor(onLogin, emit) {
        this.emit = emit;
        this.onLogin = onLogin;
        this.user = null;
    }

    logout(ignored) {
        if (this.onLogin(false, this.user.id)) {
            this.user.isOnline = false;
            this.user.save();
            this.user = null;
        };
    };

    login(data) {
        let username = data.username;
        let password = data.password;

        User.findByUsername(username, (err, user) => {
            if (err) return this.emit(Protocol.USER_LOGIN, {
                success: false,
                message: 'user not found'
            });
            user.checkPassword(password, (err, isMatch) => {
                if (err) return this.emit(Protocol.USER_LOGIN, {
                    success: false,
                    message: 'incorrect password'
                });
                if (!isMatch) return this.emit(Protocol.USER_LOGIN, {
                    success: false,
                    message: 'incorrect password'
                });
                // if (user.isOnline) return this.emit(Protocol.USER_LOGIN, { success: false, message: 'already logged in some where else'});
                if (isMatch) {
                    user.isOnline = true;
                    user.save();
                    this.user = user;
                    this.onLogin(true, this.user.id);
                    log.info(`user registered:   ${this.client.id}    ${user}`);
                    return this.emit(Protocol.USER_LOGIN, {
                        success: true,
                        message: 'login successful',
                        user: user
                    });
                }
            });
        })
    };

    onLogginEvent() {
        this.onLogin(true, this.user.id);
    };

    /** @namespace data.username */
    /** @namespace data.password */
    /** @namespace data.email */
    /** @namespace data.name */
    /** @namespace data.role */
    /** @namespace data.advisorId */
    register(data) {
        log.info(`register this:   ${this}`);
        let user = new User();
        user.username = data.username;
        user.email = {
            email: data.email,
            confirmed: false,
            confirmCode: uuid()
        };
        user.password = data.password;
        user.name = data.name;
        user.role = data.role;
        user.advisorId = data.advisorId;

        log.info(`a register attempt ${user}`);
        User.findByUsername(data.username, (err, existingUser) => {
            if (err) return this.emit(Protocol.USER_LOGIN, {
                success: false,
                message: 'database error'
            });
            if (existingUser) return this.emit(Protocol.USER_LOGIN, {
                success: false,
                message: 'user already exists'
            });
            else {
                User.createUser(user, (err, newUser) => {
                    if (err) {
                        log.info(`user error:   ${err.message}`);
                        return this.emit(Protocol.USER_LOGIN, {
                            success: false,
                            message: 'database error please try again'
                        })
                    }
                    newUser.isOnline = true;
                    newUser.save();
                    log.info(`register this:   ${this.createInfoRecord}`);
                    this.user = newUser;
                    this.onLogin(true, this.user.id);
                    // log.info(`user logged in:   ${this.client.id} ${newUser}`);
                    this.emit(Protocol.USER_LOGIN, {
                        success: true,
                        user: newUser,
                        message: 'user created and logged in'
                    });

                    // create user queue
                    var queue = new Queue({
                        userId: this.user._id
                    });
                    queue.save();
                    // if user is an student create a student doc for it
                    if (this.user.role === Protocol.UserTypes.student) {
                        var student = new Student();
                        student.username = this.user.username;
                        student.userId = this.user._id;
                        student.advisorId = this.user.advisorId;
                        student.save(function (err, student) {
                            this.emit(Protocol.STUDENT_GET, student);
                        });
                    }
                });
            }
        });
    };

    sendStudent(ignored) {
        Student.findOne({
            userId: this.user._id
        }, (err, student) => {
            this.emit(Protocol.STUDENT_GET, student);
        });
    }

    updateStudent(data) {
        Student.findOne({
            userId: this.user._id
        }, (err, student) => {
            student = Object.assign(student, data);
            student.save((err, student) => {
                this.emit(Protocol.STUDENT_GET, student);
            });
        });
    };

    sendConfirmEmail() {
        //todo
    };

    findUsers(data) {
        User.findUsers(data.querry, (err, users) => {
            this.emit(Protocol.USER_FIND, users);
        })
    }

    getAdvisor(data) {
        this.user.getAdvisor((err, user) => {
            this.emit(Protocol.USER_GET_ADVISOR, user);
        })
    }

    getUser(data) {
        User.findById(data.findById, (err, user) => {
            this.emit(Protocol.USER_GET, user);
        })
    }

    /** @namespace data.email */
    updateEmail(data) {
        this.user.email.email = data.email;
        this.user.email.confirmed = false;
        this.user.email.confirmCode = uuid();
        this.user.save((err, newUser) => {
            this.emit(Protocol.USER_UPDATE_USER, {
                user: newUser,
                message: "email updated"
            });
            this.user = newUser;
            this.sendConfirmEmail();
        })
    };

    /** @namespace data.name */
    updateName(data) {
        this.user.name = data.name;
        this.user.save((err, newUser) => {
            this.emit(Protocol.USER_UPDATE_USER, {
                user: newUser,
                message: "name updated"
            });
            this.user = newUser;
        })
    };

    /** @namespace data.bio */
    updateBio(data) {
        this.user.bio = data.bio;
        this.user.save((err, newUser) => {
            this.emit(Protocol.USER_UPDATE_USER, {
                user: newUser,
                message: "bio updated"
            });
            this.user = newUser;
        })
    };

    /** @namespace data.avatar.small */
    /** @namespace data.avatar.large */
    updateAvatar(data) {
        this.user.avatar.small = data.avatar.small;
        this.user.avatar.large = data.avatar.large;
        this.user.save((err, newUser) => {
            this.emit(Protocol.USER_UPDATE_USER, {
                user: newUser,
                message: "avatar updated"
            });
            this.user = newUser;
        })
    };

    /** @namespace data.newPassword */
    /** @namespace data.password */
    changePassword(data) {
        User.changePassword(this.user, data.password, data.newPassword, (res) => {
            this.emit(Protocol.USER_CHANGE_PASSWORD, res);
            if (res.success) this.user = res.user;
        })
    };

    getUserId() {
        return this.user.id;
    }
    getAdvisorId() {
        return this.user.advisorId;
    }
    getUser() {
        return this.user;
    }
    isAdvisor() {
        return this.user.role === Protocol.UserTypes.advisor;
    }
    isLoggedin() {
        return this.user !== null;
    }
}

module.exports = UserManager;
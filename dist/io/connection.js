"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _log = require("../log");

var _log2 = _interopRequireDefault(_log);

var _user = require("../models/user");

var _user2 = _interopRequireDefault(_user);

var _protocol = require("./protocol");

var Protocol = _interopRequireWildcard(_protocol);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*********************************
 TODO list:
    simple Login and register for advisors
    // add email confirmation and password recovery
    student creation and management function for advisors
    post and comment that advisors can create posts and students receive their advisor's post and both can comment
    student information updates
    comment replies 
    advisor-student chat
    group chats
*********************************/

var users = new Map();

var login = function login(client, data) {
    _log2.default.info("new login attempt by " + client.id + " data: " + data);
    var username = data.username;
    var password = data.password;

    _user2.default.findByUsername(username, function (err, user) {
        if (err) return client.emit(Protocol.LOGIN, { success: false, message: 'user not found' });
        user.checkPassword(password, function (err, isMatch) {
            if (err) return client.emit(Protocol.LOGIN, { success: false, message: 'incorrect password' });
            if (!isMatch) return client.emit(Protocol.LOGIN, { success: false, message: 'incorrect password' });
            if (isMatch) {
                user.isOnline = true;
                user.save();
                users.set(client.id, user);
                _log2.default.info("user registered:   " + client.id + "    " + user);
                return client.emit(Protocol.LOGIN, { success: true, message: 'login successful', user: user });
            }
        });
    });
};

var createInfoRecord = function createInfoRecord(user) {
    // todo
};

/** @namespace data.username */
/** @namespace data.password */
/** @namespace data.email */
/** @namespace data.name */
/** @namespace data.role */
/** @namespace data.advisorId */
var register = function register(client, data) {
    _log2.default.info("a register attempt from client:   " + client.id);

    var user = new _user2.default();
    user.username = data.username;
    user.email = data.email;
    user.password = data.password;
    user.name = data.name;
    user.role = data.role;
    user.advisorId = data.advisorId;

    _log2.default.info("a register attempt " + user);
    _user2.default.findByUsername(data.username, function (err, existingUser) {
        if (err) return client.emit(Protocol.LOGIN, { success: false, message: 'database error' });
        if (existingUser) return client.emit(Protocol.LOGIN, { success: false, message: 'user already exists' });else {
            user.createUser(function (err, newUser) {
                if (err) {
                    _log2.default.info("user error:   " + err.message);
                    client.emit(Protocol.LOGIN, { success: false, message: 'database error please try again' });
                }
                newUser.isOnline = true;
                newUser.save();
                users.set(client.id, user);
                _log2.default.info("user logged in:   " + client.id + " " + newUser);
                client.emit(Protocol.LOGIN, { success: true, user: newUser, message: 'user created and logged in' });
                createInfoRecord(newUser);
            });
        }
    });
};

var disconnect = function disconnect(client) {
    if (users.has(client.id)) {
        var user = users.get(client.id);
        user.isOnline = false;
        _log2.default.info("user disconnected:    " + user);
        user.save();
        users.delete(client.id);
    }
    _log2.default.info("client disconnected:  " + client.id);
};

/** @namespace data.email */
var updateEmail = function updateEmail(client, data) {
    var user = users.get(client.id);
    user.email = data.email;
    user.save(function (err, newUser) {
        client.emit(Protocol.UPDATE_USER, { user: newUser, message: "email updated" });
    });
};

/** @namespace data.name */
var updateName = function updateName(client, data) {
    var user = users.get(client.id);
    user.name = data.name;
    user.save(function (err, newUser) {
        client.emit(Protocol.UPDATE_USER, { user: newUser, message: "nae updated" });
    });
};

/** @namespace data.bio */
var updateBio = function updateBio(client, data) {
    var user = users.get(client.id);
    user.bio = data.bio;
    user.save(function (err, newUser) {
        client.emit(Protocol.UPDATE_USER, { user: newUser, message: "bio updated" });
    });
};

/** @namespace data.avatar */
var updateAvatar = function updateAvatar(client, data) {
    var user = users.get(client.id);
    user.avatar = data.avatar;
    user.save(function (err, newUser) {
        client.emit(Protocol.UPDATE_USER, { user: newUser, message: "avatar updated" });
    });
};

/** @namespace data.newPassword */
/** @namespace data.password */
var changePassword = function changePassword(client, data) {
    var user = users.get(client.id);
    user.changePassword(data.password, data.newPassword, function (res) {
        client.emit(Protocol.CHANGE_PASSWORD, res);
        if (res.success) users.set(client.id, res.user);
    });
};

var logout = function logout(client) {
    var user = users.get(client.id);
    user.isOnline = false;
    user.save();
    users.delete(client.id);
};

var connectionListener = function connectionListener(client) {
    _log2.default.info("new client connected: " + client.id);
    client.on(Protocol.LOGIN, function (data) {
        return login(client, data);
    });
    client.on(Protocol.REGISTER, function (data) {
        return register(client, data);
    });
    client.on(Protocol.UPDATE_BIO, function (data) {
        return updateBio(client, data);
    });
    client.on(Protocol.UPDATE_NAME, function (data) {
        return updateName(client, data);
    });
    client.on(Protocol.UPDATE_EMAIL, function (data) {
        return updateEmail(client, data);
    });
    client.on(Protocol.UPDATE_AVATAR, function (data) {
        return updateAvatar(client, data);
    });
    client.on(Protocol.CHANGE_PASSWORD, function (data) {
        return changePassword(client, data);
    });
    client.on(Protocol.LOGOUT, function (ignored) {
        return logout(client);
    });
    client.on('disconnect', function () {
        return disconnect(client);
    });
};

exports.default = connectionListener;

// to get key by value
// let people = new Map();
// people.set('1', 'jhon');
// people.set('2', 'jasmein');
// people.set('3', 'abdo');

// let jhonKeys = [...people.entries()]
//         .filter(({ 1: v }) => v === 'jhon')
//         .map(([k]) => k);
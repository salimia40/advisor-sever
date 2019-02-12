const mongoose = require('./init');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
const log = require('../log/log');

var UserSchema = Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String
    },
    email: {
        type: String
    },
    name: {
        type: String
    },
    bio: {
        type: String
    },
    advisorId: {
        type: Schema.ObjectId
    },
    avatar: {
        small: {
            type: String
        },
        large: {
            type: String
        }
    },
    role: {
        type: String,
        required: true,
        default: 'student'
        //  default: 'advisor'
    },
    isOnline: {
        type: Boolean,
        default: false
    }
});

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.createUser = function (newUser, callback) {
    bcrypt.genSalt(10, function (err, salt) {

        bcrypt.hash(newUser.password, salt, function (err, hash) {
            newUser.password = hash;
            newUser.save(callback);
        });
    });
};

module.exports.getUserByUsername = function (username, callback) {
    var query = {username: username};
    User.findOne(query, callback);
};

module.exports.getUserById = function (id, callback) {
    User.findById(id, callback);
};

module.exports.comparePassword = function (candidatePassword, hash, callback) {
    bcrypt.compare(candidatePassword, hash, function (err, isMatch) {
        if (err) callback(err, false);
        callback(null, isMatch);
    });
};

module.exports.changePassword = function (user, password, newPassword, callback) {

    bcrypt.compare(password, user.password, function (err, isMatch) {
        if (err) return callback({success: false, message: 'failed to change password'});
        if (isMatch) {
            bcrypt.genSalt(10, function (err, salt) {
                if (err) return callback({success: false, message: 'failed to change password'});
                bcrypt.hash(newPassword, salt, function (err, hash) {
                    if (err) return callback({success: false, message: 'failed to change password'});
                    user.password = hash;
                    user.save((err, newuser) => {
                        if (err) return callback({success: false, message: 'failed to change password'});
                        else return callback({success: true, user: newuser, message: 'password changed successfully'});
                    });
                });
            });
        } else return callback({success: false, message: 'incurrect password'});
    });

};

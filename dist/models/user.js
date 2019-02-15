"use strict";

var _group = require("./group");

var _group2 = _interopRequireDefault(_group);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mongoose = require("./init");


var bcrypt = require("bcryptjs");

var Schema = mongoose.Schema;
var userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
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
        type: ObjectId,
        ref: 'userSchema'
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
        // default: 'advisor'
    },
    isOnline: {
        type: Boolean,
        default: false
    }, groups: {
        type: ObjectId,
        ref: _group2.default
    }
});

userSchema.statics.findByUsername = function (username, callback) {
    return this.findOne({ username: username }, callback);
};

userSchema.methods.checkPassword = function (candidatePassword, callback) {
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
        if (err) callback(err, false);
        callback(null, isMatch);
    });
};

userSchema.methods.changePassword = function (password, newPassword, callback) {
    bcrypt.compare(password, this.password, function (err, isMatch) {
        if (err) return callback({ success: false, message: 'failed to change password' });
        if (isMatch) {
            bcrypt.genSalt(10, function (err, salt) {
                if (err) return callback({ success: false, message: 'failed to change password' });
                bcrypt.hash(newPassword, salt, function (err, hash) {
                    if (err) return callback({ success: false, message: 'failed to change password' });
                    // noinspection JSPotentiallyInvalidUsageOfThis
                    this.password = hash;
                    this.save(function (err, newUser) {
                        if (err) return callback({ success: false, message: 'failed to change password' });else return callback({ success: true, user: newUser, message: 'password changed successfully' });
                    });
                });
            });
        } else return callback({ success: false, message: 'incorrect password' });
    });
};

userSchema.methods.createUser = function (callback) {
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(this.password, salt, function (err, hash) {
            // noinspection JSPotentiallyInvalidUsageOfThis
            this.password = hash;
            this.save(callback);
        });
    });
};

var User = mongoose.model('User', userSchema);

// export default User;
module.exports = User;
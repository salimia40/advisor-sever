const mongoose = require("./init");
const bcrypt = require("bcryptjs");
const log = require("../log/log");

const Schema = mongoose.Schema;
const userSchema = new Schema({
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
        email:{type: String},
        confirmed: {type: Boolean, default: false},
        confirmCode: {type: String},
    },
    name: {
        type: String
    },
    bio: {
        type: String
    },
    advisorId: {
        type: Schema.Types.ObjectId,
        // ref: 'userSchema'
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
        default: 'student',
         // default: 'advisor'
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    // groups : {
    //     type: ObjectId,
    //     ref: Group
    // },
});


userSchema.statics.findByUsername = function(username,callback){
    return this.findOne({username: username},callback);
};


userSchema.methods.checkPassword = function (candidatePassword, callback) {
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
        if (err) callback(err, false);
        callback(null, isMatch);
    });
};

userSchema.methods.changePassword = function(password, newPassword, callback){
    bcrypt.compare(password, this.password, function (err, isMatch) {
        if (err) return callback({success: false, message: 'failed to change password'});
        if (isMatch) {
            bcrypt.genSalt(10, function (err, salt) {
                if (err) return callback({success: false, message: 'failed to change password'});
                bcrypt.hash(newPassword, salt, function (err, hash) {
                    if (err) return callback({success: false, message: 'failed to change password'});
                    // noinspection JSPotentiallyInvalidUsageOfThis
                    this.password = hash;
                    this.save(function(err, newUser) {
                        if (err) return callback({success: false, message: 'failed to change password'});
                        else return callback({success: true, user: newUser, message: 'password changed successfully'});
                    });
                });
            });
        } else return callback({success: false, message: 'incorrect password'});
    });

};

userSchema.statics.createUser = function (user,callback) {
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(user.password, salt, function(err, hash) {
            // noinspection JSPotentiallyInvalidUsageOfThis
            user.password = hash;
            log.info(hash);
            log.info(user);
            user.save(callback);
        });
    });
};

const User = mongoose.model('User', userSchema);

// export default User;
module.exports = User;
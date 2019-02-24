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
});

userSchema.index({username: 'text', email: 'text', name: 'text'},{default_language: 'none'});


userSchema.statics.findByUsername = function(username,callback){
    return this.findOne({username: username},callback);
};

userSchema.statics.isOnline = function(userId,callback){
    return this.findById(userId,(err,user)=> {
        if (err) return callback(false);
        callback(user.isOnline);
    });
};

userSchema.statics.findUsers = function(q,callback){
    return this.find()
    .or([{username: {$regex: q}},{email:{$regex: q}},{name:{$regex: q}}])
    .exec(callback);
};


userSchema.methods.checkPassword = function (candidatePassword, callback) {
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
        if (err) callback(err, false);
        callback(null, isMatch);
    });
};

userSchema.methods.getAdvisor = function (callback) {
    if(this.role === 'advisor') return callback(false,this);
    this.model('User').findById(this.advisorId,callback)
};

userSchema.statics.changePassword = function(user,password, newPassword, callback){
    bcrypt.compare(password, user.password, function (err, isMatch) {
        if (err) return callback({success: false, message: 'failed to change password'});
        if (isMatch) {
            bcrypt.genSalt(10, function (err, salt) {
                if (err) return callback({success: false, message: 'failed to change password'});
                bcrypt.hash(newPassword, salt, function (err, hash) {
                    if (err) return callback({success: false, message: 'failed to change password'});
                    // noinspection JSPotentiallyInvalidUsageOfThis
                    user.password = hash;
                    user.save(function(err, newUser) {
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
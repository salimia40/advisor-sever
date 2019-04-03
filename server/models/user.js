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
        email: {
            type: String
        },
        confirmed: {
            type: Boolean,
            default: false
        },
        confirmCode: {
            type: String
        },
    },
    name: {
        type: String
    },
    bio: {
        type: String
    },
    advisorId: {
        type: String,
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

userSchema.index({
    username: 'text',
    email: 'text',
    name: 'text'
}, {
    default_language: 'none'
});


userSchema.statics.findByUsername = function (username) {
    return this.findOne({
        username: username
    })
};

userSchema.statics.isOnline = function (userId) {
    return new Promise((res, rej) => {
        this.findById(userId, (err, user) => {
            if (err) return res(false);
            res(user.isOnline);
        });
    })
};

userSchema.statics.findUsers = function (q) {
    return this.find()
        .or([{
            username: {
                $regex: q
            }
        }, {
            email: {
                $regex: q
            }
        }, {
            name: {
                $regex: q
            }
        }])
};


userSchema.methods.checkPassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.getAdvisor = function () {
    return new Promise((res) => {
        if (this.role === 'advisor') return res(this);
        this.model('User').findById(this.advisorId).then(res)
    })
};

userSchema.query.students = function(userId){
    return this.where(advisorId,userId)
}

userSchema.statics.changePassword = function (user, password, newPassword, callback) {
    bcrypt.compare(password, user.password).then(isMatch => {
        if (isMatch) {
            bcrypt.hash(newPassword, 10).then(hash => {
                user.password = hash;
                user.save(function (err, newUser) {
                    if (err) return callback({
                        success: false,
                        message: 'failed to change password'
                    });
                    else return callback({
                        success: true,
                        user: newUser,
                        message: 'password changed successfully'
                    });
                });
            })
        } else return callback({
            success: false,
            message: 'incorrect password'
        });
    })
};

userSchema.statics.createUser = function (user) {
    return new Promise((res) => {
        bcrypt.hash(user.password, 10).then(function (hash) {
            user.password = hash;
            log.info(hash);
            log.info(user);
            user.save().then(res);
        });
    })
};

const User = mongoose.model('User', userSchema);

// export default User;
module.exports = User;
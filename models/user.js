const mongoose = require('./init');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

var UserSchema = Schema({
    username:{
        type:String,
        required: true  
    },
    password:{
        type: String
    },
    email:{
        type:String
    },
    name:{
        type:String
    },
    role:{
         type:String,
         required: true,
         default: 'guest' 
        //  default: 'admin' 
     },
});

var User = module.exports = mongoose.model('User',UserSchema);
module.exports.createUser = function (newUser,callback) {
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(newUser.password, salt, function(err, hash) {
            newUser.password = hash;
            newUser.save(callback);
        });
    });
};

module.exports.getUserByUsername = function(username, callback){
    var query = {username: username};
    User.findOne(query, callback);
};

module.exports.getUserById = function(id, callback){
    User.findById(id, callback);
};

module.exports.comparePassword = function(candidatePassword, hash, callback){
    bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
        if(err) throw err;
        callback(null, isMatch);
    });
};

module.exports.changePassword = function(uid,candidatePassword, newPassword, callback){
    User.findById(uid)
        .then(user => {
            bcrypt.compare(candidatePassword, user.password, function(err, isMatch) {
                if(err) return callback({success:false});
                if(isMatch){
                    bcrypt.genSalt(10, function(err, salt) {
                        if(err) return callback({success:false});
                        bcrypt.hash(newPassword, salt, function(err, hash) {
                            if(err) return callback({success:false});
                            user.password = hash;
                            user.save((err,user)=>{
                                if(err) return callback({success:false});
                                else return callback({success:true, user: user});
                            });
                        });
                    });
                } else return callback({success:false});
            });
        })
};

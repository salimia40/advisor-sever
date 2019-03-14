const mongoose = require("./init");
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    from: {type: String, },
    to: {type: String, },
    date: {type: Date, default: Date.now},
    reply:{ isReply:{type: Boolean, default: false} ,to: {type: String,}},
    content: {
        text: String,
        image: String,
        voice: String,
        file: String,
        video: String
    },
    state: {
        sent: {type: Boolean, default: true},
        received: {type: Boolean, default: false},
        viewed: {type: Boolean, default: false},
    },
    deleted: {type: Boolean, default: false},
    updated: {type: Boolean, default: false},
});

messageSchema.query.getAllChats =  function(userId,page = 1,perPage = 100){
    let skip = (page - 1) * perPage;
    return this.find().or([{to:userId},{from:userId}])
    .sort({date : -1})
    .skip(skip)
    .limit(perPage)
    
}

messageSchema.query.getUserChats =  function(userId,otherUserId,page = 1,perPage = 100){
    let skip = (page - 1) * perPage;
    return this.find().or([{to:userId,from:otherUserId},{to:otherUserId,from:userId}])
    .sort({date : -1})
    .skip(skip)
    .limit(perPage)
}

const Message = mongoose.model('Message',messageSchema);
module.exports = Message;
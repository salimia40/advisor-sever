const mongoose = require("./init");
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    from: {type: Schema.Types.ObjectId, },
    to: {type: Schema.Types.ObjectId, },
    reply:{ isReply:{type: Boolean, default: false} ,to: {type: ObjectId,}},
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

const Message = mongoose.model('Message',messageSchema);
module.exports = Message;
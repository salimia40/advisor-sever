const mongoose = require("./init");

const Schema = mongoose.Schema;
const groupCommentSchema = new Schema({
    memberId: {type: ObjectId},
    date: {type: Date, default: Date.now},
    content: {
        text: String,
        image: String,
    }
});

const groupPostSchema = new Schema({
    memberId: {type: Schema.Types.ObjectId},
    groupId: {type: Schema.Types.ObjectId},
    date: {type: Date, default: Date.now},
    document:String,
    title:String,
    comments:[groupCommentSchema]
});

const GroupPost = mongoose.model('GroupPost',groupPostSchema);
module.exports = GroupPost;
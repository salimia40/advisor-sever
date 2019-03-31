const mongoose = require("./init");

const Schema = mongoose.Schema;

const groupPostSchema = new Schema({
    memberId: {
        type: String
    },
    groupId: {
        type: String
    },
    date: Number,
    content: {
        text: String,
        image: String,
        voice: String,
        file: String,
        video: String
    },
    tags: [String],
    title: String,
    comments: [String],
    followers: [String],
    likes: [String],
    deleted: {
        type: Boolean,
        default: false
    }
});

const GroupPost = mongoose.model('GroupPost', groupPostSchema);
module.exports = GroupPost;
const mongoose = require("./init");
const Schema = mongoose.Schema;

const queueSchema = new Schema({
    userId: {
        type: String
    },
    messages: [String],
    blogs: [String],
    members: [String],

    notifications: [{
        type: String,
        userId: String,
        groupId: String,
        blogId: String,
        postId: String,
        date: {
            type: Number,
            default: Math.floor(new Date().getTime() / 1000.0)
        }
    }]
});

queueSchema.statics.getUserQueue = function (userId) {
    return this.findOne({
        userId: userId
    })
}

const Queue = mongoose.model('Queue', queueSchema);
module.exports = Queue;
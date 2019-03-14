const mongoose = require("./init");
const Schema = mongoose.Schema;

const queueSchema = new Schema({
    userId: {type: String},
    messages: [String],
    blogs: [String],
});

queueSchema.statics.getUserQueue = function(userId) {
    return this.find({userId:userId})
}

const Queue = mongoose.model('Queue',queueSchema);
module.exports = Queue;
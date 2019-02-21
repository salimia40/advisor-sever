const mongoose = require("./init");
const Schema = mongoose.Schema;

const queueSchema = new Schema({
    userId: {type: Schema.Types.ObjectId},
    messages: [Schema.Types.ObjectId],
});

const Queue = mongoose.model('Queue',queueSchema);
module.exports = Queue;
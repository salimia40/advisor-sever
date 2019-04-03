const mongoose = require("./init");

const Schema = mongoose.Schema;
const groupCommentSchema = new Schema({
    memberId: {type: String},
    gPostId: String,
    date: {type: Date, default: Date.now},
    content: {
        text: String,
        image: String,
    }
});

const GComment  = mongoose.model('GCommnet',groupCommentSchema);
module.exports = GComment;
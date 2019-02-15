const mongoose = require("./init");


const Schema = mongoose.Schema;

const commentSchema = new Schema({
    userId: {type: Schema.Types.ObjectId, },
    date: {type: Date, default: Date.now},
    content: {
        text: String,
        image: String,
    }
});

const postSchema = new Schema({
    userId: {type: Schema.Types.ObjectId, },
    date: {type: Date, default: Date.now},
    document:String,
    title:String,
    comments:[commentSchema]
});

const Post = mongoose.model('Post',postSchema);
module.exports = Post;